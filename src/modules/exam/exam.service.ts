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

@Injectable()
export class ExamService {
  constructor(
    private readonly s3Service: AwsS3Service,
    private readonly transactionService: TransactionService,
    private readonly questionService: QuestionService,
    private readonly questionSetService: QuestionSetService,
    @InjectRepository(ExamEntity)
    private readonly examRepository: Repository<ExamEntity>,
    @InjectRepository(ExamDetailEntity)
    private readonly examDetailRepository: Repository<ExamDetailEntity>,
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
      relations: ['examType'],
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

    const examDetailBySections: ExamSectionDto[] = [];
    for (const examSection of exam.examType.sections) {
      examDetailBySections.push({
        id: examSection.id,
        name: examSection.name,
        numQuestions: examSection.numQuestions,
        questions: examDetails
          .filter(
            (examDetail) =>
              examDetail.questionId && examDetail.sectionId === examSection.id,
          )
          .map((examDetail) => ({
            ...examDetail.question,
            displayOrder: examDetail.displayOrder,
          })),
        questionSets: examDetails
          .filter(
            (examDetail) =>
              examDetail.questionSetId &&
              examDetail.sectionId === examSection.id,
          )
          .map((examDetail) => ({
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
      registerStartsAt: exam.registerStartsAt?.toISOString(),
      registerEndsAt: exam.registerEndsAt?.toISOString(),
      startsAt: exam.startsAt?.toISOString(),
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
    console.log('asset files:', assetFiles);
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

        console.log('questions created: ', createdQuestions[0]);
        console.log('question sets created: ', createdQuestionSets[0]);

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
    const exam = await this.examRepository.findOneBy({ id: examId });
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

    if (assetFiles) {
      audioKeys = await Promise.all(
        assetFiles.audios.map((audioFile) =>
          this.s3Service.uploadFile(audioFile, 'audios'),
        ),
      );
      imageKeys = await Promise.all(
        assetFiles.images.map((imageFile) =>
          this.s3Service.uploadFile(imageFile, 'images'),
        ),
      );
    }

    await Promise.all(
      [...assetFiles.audios, ...assetFiles.images].map((file) =>
        deleteFileAsync(file.path),
      ),
    );

    const transactionRes = await this.transactionService.runInTransaction(
      async (queryRunner: QueryRunner) => {
        await queryRunner.manager.getRepository(ExamEntity).save({
          id: examId,
          name: updateData.name,
          examTypeId: updateData.examTypeId,
          hasMultipleSections: updateData.hasMultipleSections || true,
          timeLimitInMins: updateData.timeLimitInMins,
          registerStartsAt: updateData.registerStartsAt,
          registerEndsAt: updateData.registerEndsAt,
          startsAt: updateData.startsAt,
          examSetId: updateData.examSetId,
        });

        await Promise.all(
          (updateData.sections || []).map((examSection) =>
            Promise.all([
              ...(examSection.questions || []).map((question) =>
                this.questionService.update(
                  question.id,
                  {
                    ...question,
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
                  },
                  queryRunner,
                ),
              ),

              ...(examSection.questionSets || []).map((questionSet) =>
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
                      : null,
                    audioKey:
                      questionSet.audioFileIndex != undefined &&
                      questionSet.audioFileIndex < audioKeys.length
                        ? audioKeys[questionSet.audioFileIndex]
                        : null,
                  },
                  queryRunner,
                ),
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
        numQuestions: examSection.numQuestions,
        numCorrects:
          questions.filter(
            (question) => examResultsByQuestion.get(question.id).isCorrect,
          ).length +
          questionSets.reduce(
            (numCorrectQuestions, curQuestionSet) =>
              numCorrectQuestions +
              curQuestionSet.questions.filter(
                (question) => examResultsByQuestion.get(question.id).isCorrect,
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
      numCorrects: examResult.numCorrects,
      isPartial: examResult.isPartial,
      timeTakenInSecs: examResult.timeTakenInSecs,
      sections: examResultDetailBySections,
    };
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
