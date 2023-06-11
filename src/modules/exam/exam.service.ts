import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsWhere,
  In,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Not,
  QueryRunner,
  Repository,
} from 'typeorm';
import _ from 'lodash';

import { ExamDetailDto, ExamDto, ExamListItemDto } from './dtos/exam.dto';
import { ExamEntity } from '../../database/entities/exam.entity';
import { ExamDetailEntity } from '../../database/entities/exam-detail.entity';
import { QuestionService } from '../question/services/question.service';
import { SectionEntity } from '../../database/entities/section.entity';
import { QuestionDto } from '../question/dtos/question.dto';
import { QuestionSetService } from '../question/services/question-set.service';
import { QuestionSetDto } from '../question/dtos/question-set.dto';
import { IFile } from '../../common/models/IFile';
import { AwsS3Service } from '../../shared/services/aws-s3.service';
import { deleteFileAsync } from '../../common/utils/file-util';
import { TransactionService } from '../../shared/services/transaction.service';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { ExamFilterDto } from './dtos/exam-filter.dto';
import { ExamSectionDto } from './dtos/section.dto';
import { Order } from '../../common/constants/order';
import { ExamResultEntity } from '../../database/entities/exam-result.entity';
import { ExamAttemptResultDto } from './dtos/exam-attempt-result.dto';
import { UserService } from '../user/user.service';
import { ExamResultHistoryDto } from './dtos/exam-result-history.dto';
import { ExamRegistrationEntity } from '../../database/entities/exam-registration.entity';
import { ExamRegistrationStatus } from '../../common/constants/exam-registration-status';

@Injectable()
export class ExamService {
  constructor(
    private readonly s3Service: AwsS3Service,
    private readonly transactionService: TransactionService,
    private readonly questionService: QuestionService,
    private readonly questionSetService: QuestionSetService,
    private readonly userService: UserService,
    @InjectRepository(ExamEntity)
    private readonly examRepository: Repository<ExamEntity>,
    @InjectRepository(ExamDetailEntity)
    private readonly examDetailRepository: Repository<ExamDetailEntity>,
    @InjectRepository(ExamRegistrationEntity)
    private readonly examRegistrationRepository: Repository<ExamRegistrationEntity>,
    @InjectRepository(ExamResultEntity)
    private readonly examResultRepository: Repository<ExamResultEntity>,
  ) {}

  async list(
    searchParams: ExamFilterDto,
  ): Promise<PaginationDto<ExamListItemDto>> {
    const whereCond = this.parseSearchParams(searchParams);

    const numRecords = await this.examRepository.count({
      where: whereCond,
    });

    const exams = await this.examRepository.find({
      where: whereCond,
      skip: searchParams.skip,
      take: searchParams.perPage,
      relations: ['examType', 'examSet'],
      order: {
        id: Order.DESC,
      },
    });

    return {
      page: searchParams.page,
      pageCount: searchParams.perPage,
      totalCount: numRecords,
      data: exams.map((exam) => ({
        id: exam.id,
        name: exam.name,
        type: exam.examType?.name,
        isMiniTest: exam.isMiniTest,
        examSet: exam.examSet.title,
        registerStartsAt: exam.registerStartsAt?.toISOString(),
        registerEndsAt: exam.registerEndsAt?.toISOString(),
        startsAt: exam.startsAt?.toISOString(),
        numParticipants: exam.numParticipants || 0,
      })),
    };
  }

  async show(examId: number, accountId?: number): Promise<ExamDetailDto> {
    const exam = await this.examRepository.findOne({
      where: { id: examId },
      relations: {
        examType: {
          sections: true,
        },
      },
    });
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const examDetails = await this.examDetailRepository.find({
      where: {
        examId,
      },
      relations: {
        question: {
          answers: true,
        },
        questionSet: {
          questions: {
            answers: true,
          },
          images: true,
        },
      },
    });

    let examResults: ExamResultEntity[];
    if (accountId) {
      examResults = await this.examResultRepository.find({
        where: {
          examId,
          accountId,
        },
      });
    }

    const questionsBySection = new Map<number, ExamDetailEntity[]>();
    const questionSetsBySection = new Map<number, ExamDetailEntity[]>();

    for (const item of examDetails) {
      const sectionId = item.sectionId;
      if (!questionsBySection.has(sectionId)) {
        questionsBySection.set(sectionId, []);
      }

      if (!questionSetsBySection.has(sectionId)) {
        questionSetsBySection.set(sectionId, []);
      }

      if (item.questionId) {
        questionsBySection.get(sectionId).push(item);
      } else if (item.questionSetId) {
        questionSetsBySection.get(sectionId).push(item);
      }
    }

    const examDetailBySections: ExamSectionDto[] = [];
    for (const examSection of exam.examType.sections) {
      const sectionId = examSection.id;
      const numQuestionsInSection =
        (questionsBySection.get(sectionId)?.length || 0) +
        questionSetsBySection
          .get(sectionId)
          ?.reduce(
            (totalQuestionsInQuestionSet, curQuestionSet) =>
              totalQuestionsInQuestionSet +
              curQuestionSet.questionSet.questions.length,
            0,
          );

      examDetailBySections.push({
        id: sectionId,
        name: examSection.name,
        type: examSection.type,
        numQuestions: !exam.isMiniTest
          ? examSection.numQuestions
          : numQuestionsInSection,
        questions: questionsBySection.get(sectionId)?.map((examDetail) => ({
          ...examDetail.question,
          displayOrder: examDetail.displayOrder,
        })),
        questionSets: questionSetsBySection
          .get(sectionId)
          ?.map((examDetail) => ({
            ...examDetail.questionSet,
            questions: examDetail.questionSet.questions.sort(
              (question1, question2) =>
                (question1.orderInQuestionSet ?? 0) -
                (question2.orderInQuestionSet ?? 0),
            ),
            displayOrder: examDetail.displayOrder,
          })),
      });
    }

    return {
      id: exam.id,
      name: exam.name,
      examTypeId: exam.examTypeId,
      hasMultipleSections: exam.hasMultipleSections,
      isMiniTest: exam.isMiniTest,
      registerStartsAt: exam.registerStartsAt?.toISOString(),
      registerEndsAt: exam.registerEndsAt?.toISOString(),
      startsAt: exam.startsAt?.toISOString(),
      timeLimitInMins: exam.timeLimitInMins,
      numParticipants: exam.numParticipants,
      sections: examDetailBySections,
      examResults,
    };
  }

  async create(
    examDto: Partial<ExamDto>,
    assetFiles: {
      audios: IFile[];
      images: IFile[];
    },
  ): Promise<void> {
    // Validation
    const existingExamWithName = await this.examRepository.findOneBy({
      name: examDto.name,
    });
    if (existingExamWithName) {
      throw new BadRequestException('Exam with name already existed');
    }

    const audioAssetFiles = assetFiles.audios || [];
    const imageAssetFiles = assetFiles.images || [];

    // Upload audio and image files to S3
    const [audioKeys, imageKeys] = await Promise.all([
      Promise.all(
        audioAssetFiles.map((audioFile) =>
          this.s3Service.uploadFile(audioFile, 'audios'),
        ),
      ),
      Promise.all(
        imageAssetFiles.map((imageFile) =>
          this.s3Service.uploadFile(imageFile, 'images'),
        ),
      ),
    ]);

    await Promise.all(
      [...audioAssetFiles, ...imageAssetFiles].map((file) =>
        deleteFileAsync(file.path),
      ),
    );

    const transactionRes = await this.transactionService.runInTransaction(
      async (queryRunner: QueryRunner) => {
        const createdExam = await queryRunner.manager
          .getRepository(ExamEntity)
          .save({
            name: examDto.name,
            examTypeId: examDto.examTypeId,
            hasMultipleSections: examDto.hasMultipleSections || true,
            isMiniTest: examDto.isMiniTest || false,
            timeLimitInMins: examDto.timeLimitInMins,
            registerStartsAt: examDto.registerStartsAt,
            registerEndsAt: examDto.registerEndsAt,
            startsAt: examDto.startsAt,
            examSetId: examDto.examSetId,
          });

        const sections = await queryRunner.manager
          .getRepository(SectionEntity)
          .find({
            where: {
              id: In(examDto.sections.map((section) => section.id)),
            },
          });

        // save questions and mapping with sections
        const questionsToCreate = examDto.sections.reduce<QuestionDto[]>(
          (questions, sectionData, idx) => {
            const sectionQuestions = sectionData.questions || [];

            return questions.concat(
              sectionQuestions.map((question, questionIdx) => ({
                ...question,
                orderInQuestionSet: question.orderInQuestionSet ?? questionIdx,
                displayOrder: question.displayOrder ?? questionIdx,
                sectionId: sections[idx].id,
                audioKey:
                  question.audioFileIndex != undefined &&
                  question.audioFileIndex < audioKeys.length
                    ? audioKeys[question.audioFileIndex]
                    : null,
                imageKey:
                  question.imageFileIndex != undefined &&
                  question.imageFileIndex < imageKeys.length
                    ? imageKeys[question.imageFileIndex]
                    : null,
              })),
            );
          },
          [],
        );

        const questionSetsToCreate = examDto.sections.reduce<QuestionSetDto[]>(
          (questionSets, sectionData, idx) => {
            const sectionQuestionSets = sectionData.questionSets ?? [];

            return questionSets.concat(
              sectionQuestionSets.map((questionSet, questionSetIdx) => ({
                ...questionSet,
                displayOrder:
                  questionSet.displayOrder ??
                  examDto.sections[idx].questions?.length + questionSetIdx,

                imageKeys: questionSet.imageFileIndices
                  ? imageKeys.filter((_, idx) =>
                      questionSet.imageFileIndices.includes(idx),
                    )
                  : null,
                audioKey:
                  questionSet.audioFileIndex != undefined &&
                  questionSet.audioFileIndex < audioKeys.length
                    ? audioKeys[questionSet.audioFileIndex]
                    : null,
                sectionId: sections[idx].id,
              })),
            );
          },
          [],
        );
        const [createdQuestions, createdQuestionSets] = await Promise.all([
          this.questionService.bulkCreate(questionsToCreate, queryRunner),
          this.questionSetService.bulkCreate(questionSetsToCreate, queryRunner),
        ]);

        // save exam details
        await queryRunner.manager.getRepository(ExamDetailEntity).save([
          ...createdQuestions.map((questionId, idx) => ({
            questionId,
            sectionId: questionsToCreate[idx].sectionId,
            examId: createdExam.id,
            displayOrder: questionsToCreate[idx].displayOrder,
          })),
          ...createdQuestionSets.map((questionSetId, idx) => ({
            questionSetId,
            sectionId: questionSetsToCreate[idx].sectionId,
            examId: createdExam.id,
            displayOrder: questionSetsToCreate[idx].displayOrder,
          })),
        ]);
      },
    );

    if (!transactionRes) {
      await Promise.all(
        [...audioKeys, ...imageKeys].map((key) =>
          this.s3Service.deleteFile(key),
        ),
      );
      throw new InternalServerErrorException('DB operations faileds');
    }
  }

  async update(
    examId: number,
    updateData: Partial<ExamDto>,
    assetFiles?: {
      audios: IFile[];
      images: IFile[];
    },
  ): Promise<void> {
    const exam = await this.examRepository.findOne({
      where: { id: examId },
      relations: {
        details: true,
      },
    });
    if (!exam) {
      throw new BadRequestException('Exam not found');
    }

    // Validation
    const existingExamWithName = await this.examRepository.findOneBy({
      name: updateData.name,
      id: Not(examId),
    });
    if (existingExamWithName) {
      throw new BadRequestException('Exam with name already existed');
    }

    // Upload audio and image files to S3
    let audioKeys: string[] = [];
    let imageKeys: string[] = [];

    if (assetFiles.audios?.length) {
      audioKeys = await Promise.all(
        assetFiles.audios.map((audioFile) =>
          this.s3Service.uploadFile(audioFile, 'audios'),
        ),
      );
    }
    if (assetFiles.images?.length) {
      imageKeys = await Promise.all(
        assetFiles.images.map((imageFile) =>
          this.s3Service.uploadFile(imageFile, 'images'),
        ),
      );
    }

    await Promise.all(
      [...(assetFiles.audios || []), ...(assetFiles.images || [])].map((file) =>
        deleteFileAsync(file.path),
      ),
    );

    const transactionRes = await this.transactionService.runInTransaction(
      async (queryRunner: QueryRunner) => {
        await queryRunner.manager.getRepository(ExamEntity).save({
          id: examId,
          ..._.omitBy(
            _.pick(updateData, [
              'name',
              'timeLimitInMins',
              'registerStartsAt',
              'registerEndsAt',
              'startsAt',
              'isMiniTest',
              'numParticipant',
              'audioKey',
              'examSetId',
            ]),
            _.isNil,
          ),
        });

        const questionsToCreate = updateData.sections.reduce<QuestionDto[]>(
          (questions, sectionData) => {
            const sectionQuestions = (sectionData.questions || []).filter(
              (question) => !question.id,
            );

            return questions.concat(
              sectionQuestions.map((question, questionIdx) => ({
                ...question,
                orderInQuestionSet: question.orderInQuestionSet ?? questionIdx,
                displayOrder: question.displayOrder ?? questionIdx,
                sectionId: sectionData.id,
                audioKey:
                  question.audioFileIndex != undefined &&
                  question.audioFileIndex < audioKeys.length
                    ? audioKeys[question.audioFileIndex]
                    : null,
                imageKey:
                  question.imageFileIndex != undefined &&
                  question.imageFileIndex < imageKeys.length
                    ? imageKeys[question.imageFileIndex]
                    : null,
              })),
            );
          },
          [],
        );

        const questionSetsToCreate = updateData.sections.reduce<
          QuestionSetDto[]
        >((questionSets, sectionData) => {
          const sectionQuestionSets = (sectionData.questionSets ?? []).filter(
            (questionSet) => !questionSet.id,
          );

          return questionSets.concat(
            sectionQuestionSets.map((questionSet, questionSetIdx) => ({
              ...questionSet,
              displayOrder:
                questionSet.displayOrder ??
                sectionData.questions?.length + questionSetIdx,
              imageKeys: questionSet.imageFileIndices
                ? imageKeys.filter((_, idx) =>
                    questionSet.imageFileIndices.includes(idx),
                  )
                : null,
              audioKey:
                questionSet.audioFileIndex != undefined &&
                questionSet.audioFileIndex < audioKeys.length
                  ? audioKeys[questionSet.audioFileIndex]
                  : null,
              sectionId: sectionData.id,
            })),
          );
        }, []);
        const [createdQuestions, createdQuestionSets] = await Promise.all([
          this.questionService.bulkCreate(questionsToCreate, queryRunner),
          this.questionSetService.bulkCreate(questionSetsToCreate, queryRunner),
        ]);

        // save exam details
        await queryRunner.manager.getRepository(ExamDetailEntity).save([
          ...createdQuestions.map((questionId, idx) => ({
            questionId,
            sectionId: questionsToCreate[idx].sectionId,
            examId: exam.id,
            displayOrder: questionsToCreate[idx].displayOrder,
          })),
          ...createdQuestionSets.map((questionSetId, idx) => ({
            questionSetId,
            sectionId: questionSetsToCreate[idx].sectionId,
            examId: exam.id,
            displayOrder: questionSetsToCreate[idx].displayOrder,
          })),
        ]);

        const questionsToRemove = (exam.details || [])
          .filter(
            (detail) =>
              detail.questionId &&
              !updateData.sections.some((section) =>
                section.questions.some(
                  (question) =>
                    question.id && question.id === detail.questionId,
                ),
              ),
          )
          .map((detail) => detail.questionId);

        const questionSetsToRemove = (exam.details || [])
          .filter(
            (detail) =>
              detail.questionSetId &&
              !updateData.sections.some((section) =>
                section.questionSets.some(
                  (questionSet) =>
                    questionSet.id && questionSet.id === detail.questionSetId,
                ),
              ),
          )
          .map((detail) => detail.questionSetId);

        await Promise.all(
          (updateData.sections || []).map((examSection, idx) =>
            Promise.all([
              ...(examSection.questions || [])
                .filter((question) => question.id)
                .map((question, questionIdx) =>
                  this.questionService.update(
                    question.id,
                    {
                      ...question,
                      orderInQuestionSet:
                        question.orderInQuestionSet ?? questionIdx,
                      displayOrder: question.displayOrder ?? questionIdx,
                      audioKey:
                        question.audioFileIndex != undefined &&
                        question.audioFileIndex < audioKeys.length
                          ? audioKeys[question.audioFileIndex]
                          : question.audioKey,
                      imageKey:
                        question.imageFileIndex != undefined &&
                        question.imageFileIndex < imageKeys.length
                          ? imageKeys[question.imageFileIndex]
                          : question.imageKey,
                    },
                    queryRunner,
                  ),
                ),
              ...(examSection.questionSets || [])
                .filter((questionSet) => questionSet.id)
                .map((questionSet, questionSetIdx) =>
                  this.questionSetService.update(
                    questionSet.id,
                    {
                      ...questionSet,
                      imageKeys: questionSet.imageFileIndices
                        ? [
                            ...(questionSet.imageKeys ?? []),
                            ...imageKeys.filter((_, idx) =>
                              questionSet.imageFileIndices.includes(idx),
                            ),
                          ]
                        : questionSet.imageKeys,
                      audioKey:
                        questionSet.audioFileIndex != undefined &&
                        questionSet.audioFileIndex < audioKeys.length
                          ? audioKeys[questionSet.audioFileIndex]
                          : questionSet.audioKey,
                      displayOrder:
                        questionSet.displayOrder ??
                        updateData.sections[idx].questions?.length +
                          questionSetIdx,
                    },
                    queryRunner,
                  ),
                ),
              this.questionService.bulkDeleteFromExam(
                questionsToRemove,
                examId,
                queryRunner,
              ),
              this.questionSetService.bulkDeleteFromExam(
                questionSetsToRemove,
                examId,
                queryRunner,
              ),
            ]),
          ),
        );
      },
    );

    if (!transactionRes) {
      await Promise.all(
        [...audioKeys, ...imageKeys].map((key) =>
          this.s3Service.deleteFile(key),
        ),
      );
      throw new InternalServerErrorException('DB operations faileds');
    }
  }

  async delete(examId: number): Promise<void> {
    const exam = await this.examRepository.findOneBy({ id: examId });
    if (!exam) {
      throw new BadRequestException('Exam not found');
    }

    await this.examRepository.softDelete(examId);
  }

  async register(examId: number, accountId: number): Promise<void> {
    const exam = await this.examRepository.findOneBy({ id: examId });
    if (!exam) {
      throw new BadRequestException('Exam not found');
    }
    const user = await this.userService.findOneById(accountId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const existingRegistration = await this.examRegistrationRepository.findOne({
      where: {
        accountId,
        examId,
      },
    });
    if (existingRegistration) {
      throw new BadRequestException('User already registered for this exam');
    }

    await this.examRegistrationRepository.save({
      accountId,
      examId,
      status: ExamRegistrationStatus.ACCEPTED,
    });
  }

  async cancelRegistration(examId: number, accountId: number): Promise<void> {
    const exam = await this.examRepository.findOneBy({ id: examId });
    if (!exam) {
      throw new BadRequestException('Exam not found');
    }
    const user = await this.userService.findOneById(accountId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const existingRegistration = await this.examRegistrationRepository.findOne({
      where: {
        accountId,
        examId,
      },
    });
    if (!existingRegistration) {
      throw new BadRequestException('User not registered for this exam yet');
    }

    await this.examRegistrationRepository.save({
      accountId,
      examId,
      status: ExamRegistrationStatus.CANCELLED,
    });
  }

  async getAttemptResult(examResultId: number): Promise<ExamAttemptResultDto> {
    const examResult = await this.examResultRepository.findOne({
      where: {
        id: examResultId,
      },
      relations: {
        detailResults: true,
        exam: {
          examType: {
            sections: true,
          },
        },
      },
    });
    if (!examResult) {
      throw new NotFoundException('Exam result not found');
    }

    const examResultsByQuestion = new Map<
      number,
      { selectedAnswerId: number; isCorrect: boolean }
    >();
    for (const detailResult of examResult.detailResults || []) {
      examResultsByQuestion.set(detailResult.questionId, {
        selectedAnswerId: detailResult.selectedAnswerId,
        isCorrect: detailResult.isCorrect,
      });
    }

    const examDetails = await this.examDetailRepository.find({
      where: {
        examId: examResult.examId,
      },
      relations: {
        question: {
          answers: true,
        },
        questionSet: {
          questions: {
            answers: true,
          },
          images: true,
        },
      },
    });

    const examResultDetailBySections: ExamSectionDto[] = [];
    for (const examSection of examResult.exam.examType.sections) {
      const questions = examDetails
        .filter(
          (examDetail) =>
            examDetail.questionId && examDetail.sectionId === examSection.id,
        )
        .map((examDetail) => ({
          ...examDetail.question,
          displayOrder: examDetail.displayOrder,
        }));
      const questionSets = examDetails
        .filter(
          (examDetail) =>
            examDetail.questionSetId && examDetail.sectionId === examSection.id,
        )
        .map((examDetail) => ({
          ...examDetail.questionSet,
          displayOrder: examDetail.displayOrder,
        }));
      examResultDetailBySections.push({
        id: examSection.id,
        name: examSection.name,
        type: examSection.type,
        numQuestions: examSection.numQuestions,
        numCorrects:
          questions.filter(
            (question) => examResultsByQuestion.get(question.id)?.isCorrect,
          ).length +
          questionSets.reduce(
            (numCorrectQuestions, curQuestionSet) =>
              numCorrectQuestions +
              curQuestionSet.questions.filter(
                (question) => examResultsByQuestion.get(question.id)?.isCorrect,
              ).length,
            0,
          ),
        questions: questions
          .map((question) => ({
            ...question,
            ...examResultsByQuestion.get(question.id),
            displayOrder: question.displayOrder,
          }))
          .sort(
            (question1, question2) =>
              (question1.displayOrder ?? 0) - (question2.displayOrder ?? 0),
          ),
        questionSets: questionSets
          .map((questionSet) => ({
            ...questionSet,
            questions: questionSet.questions
              .sort(
                (question1, question2) =>
                  (question1.orderInQuestionSet ?? 0) -
                  (question2.orderInQuestionSet ?? 0),
              )
              .map((question) => ({
                ...question,
                ...examResultsByQuestion.get(question.id),
              })),
            displayOrder: questionSet.displayOrder,
          }))
          .sort(
            (qs1, qs2) => (qs1.displayOrder ?? 0) - (qs2.displayOrder ?? 0),
          ),
      });
    }

    return {
      id: examResultId,
      examId: examResult.examId,
      examName: examResult.exam.name,
      numCorrects: examResult.numCorrects,
      readingPoints: examResult.readingPoints,
      listeningPoints: examResult.listeningPoints,
      totalPoints: examResult.totalPoints,
      isPartial: examResult.isPartial,
      timeTakenInSecs: examResult.timeTakenInSecs,
      sections: examResultDetailBySections,
    };
  }

  async getResultHistories(accountId: number): Promise<ExamResultHistoryDto[]> {
    const user = await this.userService.findOneById(accountId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const examResults = await this.examResultRepository.find({
      where: {
        accountId,
      },
      relations: ['exam'],
      order: {
        id: Order.DESC,
      },
    });

    return examResults.map((result) => ({
      examResultId: result.id,
      examId: result.examId,
      examName: result.exam.name,
      numCorrects: result.numCorrects,
      listeningPoints: result.listeningPoints,
      readingPoints: result.readingPoints,
      totalPoints: result.totalPoints,
      timeTakenInSecs: result.timeTakenInSecs,
      createdAt: result.createdAt,
    }));
  }

  private parseSearchParams(
    searchParams: ExamFilterDto,
  ): FindOptionsWhere<ExamEntity> {
    const whereCond: FindOptionsWhere<ExamEntity> = {};

    if (searchParams.q) {
      whereCond.name = Like(`%${searchParams}%`);
    }

    if (searchParams.examSetId) {
      whereCond.examSetId = searchParams.examSetId;
    }

    if (searchParams.registerTimeFrom) {
      whereCond.registerStartsAt = MoreThanOrEqual(
        new Date(searchParams.registerTimeFrom),
      );
    }

    if (searchParams.registerTimeTo) {
      whereCond.registerEndsAt = LessThanOrEqual(
        new Date(searchParams.registerTimeTo),
      );
    }

    if (searchParams.startTimeFrom) {
      whereCond.startsAt = MoreThanOrEqual(
        new Date(searchParams.startTimeFrom),
      );
    }

    if (searchParams.startTimeTo) {
      whereCond.startsAt = LessThanOrEqual(new Date(searchParams.startTimeTo));
    }

    return whereCond;
  }
}
