import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  And,
  FindOptionsWhere,
  In,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Not,
  QueryRunner,
  Repository,
} from 'typeorm';
import _ from 'lodash';
import moment from 'moment-timezone';

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
import { PaginationOptionDto } from '../../common/dtos/pagination-option.dto';
import { AccountEntity } from '../../database/entities/account.entity';
import { ExamTypeEntity } from '../../database/entities/exam-type.entity';
import { ExamType } from '../../common/constants/exam-type';
import { UserProgressDto } from './dtos/user-progress.dto';
import { ExamScope } from '../../common/constants/exam-scope';
import { GroupRequestToJoinStatus } from '../group/enums/group-request-to-join-status';
import { ExamResultStatsDto } from './dtos/exam-result-stats.dto';

@Injectable()
export class ExamService {
  constructor(
    private readonly s3Service: AwsS3Service,
    private readonly transactionService: TransactionService,
    private readonly questionService: QuestionService,
    private readonly questionSetService: QuestionSetService,
    private readonly userService: UserService,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(ExamTypeEntity)
    private readonly examTypeRepository: Repository<ExamTypeEntity>,
    @InjectRepository(ExamEntity)
    private readonly examRepository: Repository<ExamEntity>,
    @InjectRepository(ExamDetailEntity)
    private readonly examDetailRepository: Repository<ExamDetailEntity>,
    @InjectRepository(ExamRegistrationEntity)
    private readonly examRegistrationRepository: Repository<ExamRegistrationEntity>,
    @InjectRepository(ExamResultEntity)
    private readonly examResultRepository: Repository<ExamResultEntity>,
    @InjectRepository(SectionEntity)
    private readonly sectionRepository: Repository<SectionEntity>,
  ) {}

  async list(
    searchParams: ExamFilterDto,
    authUserId: number,
  ): Promise<PaginationDto<ExamListItemDto>> {
    const user = await this.accountRepository.findOne({
      where: { id: authUserId },
      relations: ['accountGroups', 'roles'],
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const whereCond = this.parseSearchParams(searchParams);

    const isAdmin = user.roles.some((role) => role.isAdmin);
    const accessScopeFilter = [];
    if (!isAdmin) {
      accessScopeFilter.push(ExamScope.PUBLIC, ExamScope.VIP);
    }
    if (accessScopeFilter.length) {
      whereCond.accessScope = In(accessScopeFilter);
    }
    const userGroupIds = (user.accountGroups || [])
      .filter(
        (accGroup) =>
          accGroup.requestToJoinStatus === GroupRequestToJoinStatus.ACCEPTED,
      )
      .map((accGroup) => accGroup.groupId);
    if (
      searchParams.groupId &&
      (isAdmin || userGroupIds.includes(searchParams.groupId))
    ) {
      whereCond.groupId = searchParams.groupId;
    }

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
        accessScope: exam.accessScope,
        timeLimitInMins: exam.timeLimitInMins,
        isMiniTest: exam.isMiniTest,
        examSet: exam.examSet?.title,
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
    let examRegistration: ExamRegistrationEntity;
    if (accountId) {
      examResults = await this.examResultRepository.find({
        where: {
          examId,
          accountId,
        },
      });
      examRegistration = await this.examRegistrationRepository.findOne({
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
      accessScope: exam.accessScope,
      hasMultipleSections: exam.hasMultipleSections,
      isMiniTest: exam.isMiniTest,
      registerStartsAt: exam.registerStartsAt?.toISOString(),
      registerEndsAt: exam.registerEndsAt?.toISOString(),
      startsAt: exam.startsAt?.toISOString(),
      timeLimitInMins: exam.timeLimitInMins,
      numParticipants: exam.numParticipants,
      sections: examDetailBySections,
      registrationStatus: examRegistration?.status ?? null,
      examResults,
    };
  }

  async create(
    examDto: Partial<ExamDto>,
    assetFiles: {
      audios: IFile[];
      images: IFile[];
    },
    authUserId: number,
  ): Promise<void> {
    const user = await this.accountRepository.findOne({
      where: {
        id: authUserId,
      },
      relations: ['accountGroups', 'roles'],
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (
      examDto.groupId &&
      !user.roles.some((role) => role.isAdmin) &&
      !user.accountGroups.some(
        (accGroup) => accGroup.groupId === examDto.groupId && accGroup.isAdmin,
      )
    ) {
      throw new ForbiddenException(
        'User not allowed to create exam of a different group',
      );
    }
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
            accessScope: examDto.accessScope as ExamScope,
            groupId: examDto.groupId,
            hasMultipleSections: examDto.hasMultipleSections || true,
            isMiniTest: examDto.isMiniTest || false,
            timeLimitInMins: examDto.timeLimitInMins,
            registerStartsAt: examDto.registerStartsAt
              ? moment(examDto.registerStartsAt).format('YYYYMMDD HH:mm')
              : undefined,
            registerEndsAt: examDto.registerEndsAt
              ? moment(examDto.registerEndsAt).format('YYYYMMDD HH:mm')
              : undefined,
            startsAt: examDto.startsAt
              ? moment(examDto.startsAt).format('YYYYMMDD HH:mm')
              : undefined,
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
    authUserId: number,
    updateData: Partial<ExamDto>,
    assetFiles?: {
      audios: IFile[];
      images: IFile[];
    },
  ): Promise<void> {
    const user = await this.accountRepository.findOne({
      where: {
        id: authUserId,
      },
      relations: ['accountGroups', 'roles'],
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (
      updateData.groupId &&
      !user.roles.some((role) => role.isAdmin) &&
      !(user.accountGroups || []).some(
        (accGroup) =>
          accGroup.groupId === updateData.groupId && accGroup.isAdmin,
      )
    ) {
      throw new ForbiddenException('User is not admin of group');
    }

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
              'groupId',
              'accessScope',
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

  async delete(examId: number, authUserId: number): Promise<void> {
    const user = await this.accountRepository.findOne({
      where: {
        id: authUserId,
      },
      relations: ['groups', 'roles'],
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const exam = await this.examRepository.findOneBy({ id: examId });
    if (!exam) {
      throw new BadRequestException('Exam not found');
    }

    if (
      exam.groupId &&
      !user.roles.some((role) => role.isAdmin) &&
      !(user.accountGroups || []).some(
        (accGroup) => accGroup.groupId === exam.groupId && accGroup.isAdmin,
      )
    ) {
      throw new ForbiddenException('User is not admin of the group');
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

    if (!exam.startsAt) {
      throw new BadRequestException(
        'Exam is not configured for online registration',
      );
    }

    const now = moment(new Date());

    if (
      now.isAfter(moment(exam.registerEndsAt)) ||
      now.isAfter(moment(exam.startsAt).add(exam.timeLimitInMins, 'minutes'))
    ) {
      throw new BadRequestException('Exam registration is past due date');
    }

    const existingRegistration = await this.examRegistrationRepository.findOne({
      where: {
        accountId,
        examId,
      },
    });
    if (
      existingRegistration &&
      existingRegistration.status !== ExamRegistrationStatus.CANCELLED
    ) {
      throw new BadRequestException('User already registered for this exam');
    }

    if (existingRegistration) {
      existingRegistration.status = ExamRegistrationStatus.ACCEPTED;
      await existingRegistration.save();
    } else {
      await this.examRegistrationRepository.save({
        accountId,
        examId,
        status: ExamRegistrationStatus.ACCEPTED,
      });
    }
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

    if (
      ![
        ExamRegistrationStatus.PENDING,
        ExamRegistrationStatus.ACCEPTED,
      ].includes(existingRegistration.status)
    ) {
      throw new BadRequestException(
        'Registration already cancelled or rejected',
      );
    }

    existingRegistration.status = ExamRegistrationStatus.CANCELLED;
    await existingRegistration.save();
  }

  async getAttemptResult(examResultId: number): Promise<ExamAttemptResultDto> {
    const examResult = await this.examResultRepository.findOne({
      where: {
        id: examResultId,
      },
      relations: {
        resultsBySection: true,
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

    const examSections = (
      await this.sectionRepository.find({
        where: {
          examTypeId: examResult.exam.examTypeId,
        },
      })
    ).filter((section) =>
      (examResult.resultsBySection || []).some(
        (existingResultBySection) =>
          existingResultBySection.sectionId === section.id,
      ),
    );

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
    for (const examSection of examSections) {
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

  async getResultHistories(
    accountId: number,
    pagination: PaginationOptionDto,
  ): Promise<PaginationDto<ExamResultHistoryDto>> {
    const user = await this.userService.findOneById(accountId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const numRecords = await this.examResultRepository.count({
      where: { accountId },
    });

    const examResults = await this.examResultRepository.find({
      where: { accountId },
      skip: pagination.skip,
      take: pagination.perPage,
      relations: {
        exam: true,
      },
      order: {
        id: Order.DESC,
      },
    });

    return {
      page: pagination.page,
      pageCount: pagination.perPage,
      totalCount: numRecords,
      data: examResults.map((result) => ({
        examResultId: result.id,
        examId: result.examId,
        examName: result.exam.name,
        isMiniTest: result.exam.isMiniTest,
        numCorrects: result.numCorrects,
        isPartial: result.isPartial,
        numQuestions: result.numQuestions,
        listeningPoints: result.listeningPoints,
        readingPoints: result.readingPoints,
        totalPoints: result.totalPoints,
        timeTakenInSecs: result.timeTakenInSecs,
        createdAt: result.createdAt,
      })),
    };
  }

  async getUserProgress(
    userId: number,
    from?: string,
    to?: string,
  ): Promise<UserProgressDto> {
    const user = await this.accountRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const toeicType = await this.examTypeRepository.findOne({
      where: {
        name: ExamType.TOEIC,
      },
    });
    const examSections = await this.sectionRepository.find({
      where: {
        examTypeId: toeicType.id,
      },
    });

    const whereCond: FindOptionsWhere<ExamResultEntity> = {
      accountId: userId,
      exam: {
        isMiniTest: false,
      },
    };
    if (from && to) {
      whereCond.createdAt = And(
        MoreThanOrEqual(new Date(from)),
        LessThan(moment(to).add(1, 'day').toDate()),
      );
    }

    const examResults = await this.examResultRepository.find({
      where: whereCond,
      relations: {
        resultsBySection: true,
      },
      order: {
        id: Order.ASC,
      },
    });

    const userProgress: UserProgressDto = {
      histories: [],
      stats: {
        avgTotal: 0,
        avgListening: 0,
        avgReading: 0,
        avgBySections: [],
      },
    };

    let totalPointsOfAllExams = 0;
    let totalListeningPointsOfAllExams = 0;
    let totalReadingPointsOfAllExams = 0;
    const totalNumCorrectsOfAllExamsBySection = new Map<number, number>();

    for (const examResult of examResults) {
      if (!examResult.isPartial) {
        userProgress.histories.push({
          createdAt: examResult.createdAt,
          listeningPoints: examResult.listeningPoints || 0,
          readingPoints: examResult.readingPoints || 0,
          totalPoints: examResult.totalPoints || 0,
        });
        totalPointsOfAllExams += examResult.totalPoints || 0;
        totalListeningPointsOfAllExams += examResult.listeningPoints || 0;
        totalReadingPointsOfAllExams += examResult.readingPoints || 0;
      }

      for (const section of examSections) {
        const sectionResult = (examResult.resultsBySection || []).find(
          (existingSectionResult) =>
            existingSectionResult.sectionId === section.id,
        );
        if (!sectionResult) {
          continue;
        }
        if (!totalNumCorrectsOfAllExamsBySection.has(section.id)) {
          totalNumCorrectsOfAllExamsBySection.set(
            section.id,
            sectionResult.numCorrects,
          );
        } else {
          totalNumCorrectsOfAllExamsBySection.set(
            section.id,
            totalNumCorrectsOfAllExamsBySection.get(section.id) +
              sectionResult.numCorrects,
          );
        }
      }
    }

    const numFullTestAttempts = examResults.filter(
      (result) => !result.isPartial,
    ).length;
    const numAttempts = examResults.length;
    if (numAttempts) {
      userProgress.stats.avgTotal = Math.round(
        totalPointsOfAllExams / numFullTestAttempts,
      );
      userProgress.stats.avgListening = Math.round(
        totalListeningPointsOfAllExams / numFullTestAttempts,
      );
      userProgress.stats.avgReading = Math.round(
        totalReadingPointsOfAllExams / numFullTestAttempts,
      );
      for (const [
        sectionId,
        totalNumCorrects,
      ] of totalNumCorrectsOfAllExamsBySection.entries()) {
        const examSection = examSections.find((es) => es.id === sectionId);
        userProgress.stats.avgBySections.push({
          sectionId,
          sectionName: examSection.name,
          numQuestions: examSection.numQuestions,
          numCorrects: Math.round(totalNumCorrects / numAttempts),
        });
      }
    }

    return userProgress;
  }

  async getResultStats(examId: number): Promise<ExamResultStatsDto> {
    const exam = await this.examRepository.findOneBy({ id: examId });
    if (!exam) {
      throw new BadRequestException('Exam not found');
    }
    const toeicType = await this.examTypeRepository.findOne({
      where: {
        name: ExamType.TOEIC,
      },
    });
    const examSections = await this.sectionRepository.find({
      where: {
        examTypeId: toeicType.id,
      },
    });

    const whereCond: FindOptionsWhere<ExamResultEntity> = {
      examId,
      exam: {
        isMiniTest: false,
      },
    };

    const examResults = await this.examResultRepository.find({
      where: whereCond,
      relations: {
        resultsBySection: true,
        detailResults: true,
      },
    });
    const numTotalAttempts = examResults.length;
    let avgTotal = 0;
    let avgListening = 0;
    let avgReading = 0;
    const totalPointDistributionMappings = new Map<number, number>();
    const readingPointDistributionMappings = new Map<number, number>();
    const listeningPointDistributionMappings = new Map<number, number>();
    const numCorrectsBySection = new Map<number, number>();

    for (const res of examResults) {
      // overall average
      avgTotal += (res.totalPoints || 0) / numTotalAttempts;
      avgListening += (res.listeningPoints || 0) / numTotalAttempts;
      avgReading += (res.readingPoints || 0) / numTotalAttempts;

      // point distributions
      if (!totalPointDistributionMappings.has(res.totalPoints)) {
        totalPointDistributionMappings.set(res.totalPoints, 1);
      } else {
        totalPointDistributionMappings.set(
          res.totalPoints,
          totalPointDistributionMappings.get(res.totalPoints) + 1,
        );
      }
      if (!readingPointDistributionMappings.has(res.readingPoints)) {
        readingPointDistributionMappings.set(res.readingPoints, 1);
      } else {
        readingPointDistributionMappings.set(
          res.readingPoints,
          readingPointDistributionMappings.get(res.readingPoints) + 1,
        );
      }
      if (!listeningPointDistributionMappings.has(res.listeningPoints)) {
        listeningPointDistributionMappings.set(res.listeningPoints, 1);
      } else {
        listeningPointDistributionMappings.set(
          res.listeningPoints,
          listeningPointDistributionMappings.get(res.listeningPoints) + 1,
        );
      }

      // % of correct answers by sections
      const resultsBySection = res.resultsBySection || [];
      for (const sectionRes of resultsBySection) {
        if (!numCorrectsBySection.has(sectionRes.sectionId)) {
          numCorrectsBySection.set(
            sectionRes.sectionId,
            sectionRes.numCorrects,
          );
        } else {
          numCorrectsBySection.set(
            sectionRes.sectionId,
            numCorrectsBySection.get(sectionRes.sectionId) +
              sectionRes.numCorrects,
          );
        }
      }

      // % of correct answers by questions
      // const resultsByQuestion = res.detailResults || [];
      // for (const questionRes of resultsByQuestion) {
      //   if (!numCorrectsByQuestion.has(questionRes.questionId)) {
      //     numCorrectsByQuestion.set(
      //       questionRes.questionId,
      //       questionRes.isCorrect ? 1 : 0,
      //     );
      //   } else {
      //     numCorrectsByQuestion.set(
      //       questionRes.questionId,
      //       numCorrectsByQuestion.get(questionRes.questionId) +
      //         (questionRes.isCorrect ? 1 : 0),
      //     );
      //   }
      // }
    }

    const totalPointDistributions: { point: number; freq: number }[] = [];
    for (const [
      point,
      numEntries,
    ] of totalPointDistributionMappings.entries()) {
      totalPointDistributions.push({
        point,
        freq: numEntries,
      });
    }

    const readingPointDistributions: { point: number; freq: number }[] = [];
    for (const [
      point,
      numEntries,
    ] of readingPointDistributionMappings.entries()) {
      readingPointDistributions.push({
        point,
        freq: numEntries,
      });
    }

    const listeningPointDistributions: { point: number; freq: number }[] = [];
    for (const [
      point,
      numEntries,
    ] of listeningPointDistributionMappings.entries()) {
      listeningPointDistributions.push({
        point,
        freq: numEntries,
      });
    }

    const correctPercentBySections: {
      sectionId: number;
      sectionName: string;
      numQuestions: number;
      correctPercent: number;
    }[] = [];
    for (const [sectionId, numCorrects] of numCorrectsBySection.entries()) {
      const section = examSections.find((section) => section.id === sectionId);
      correctPercentBySections.push({
        sectionId,
        sectionName: section.name,
        numQuestions: section.numQuestions,
        correctPercent:
          (numCorrects / (numTotalAttempts * section.numQuestions)) * 100,
      });
    }

    return {
      avgTotal,
      avgListening,
      avgReading,
      totalPointDistributions,
      listeningPointDistributions,
      readingPointDistributions,
      correctPercentBySections,
    };
  }

  private parseSearchParams(
    searchParams: ExamFilterDto,
  ): FindOptionsWhere<ExamEntity> {
    const whereCond: FindOptionsWhere<ExamEntity> = {};

    if (searchParams.q) {
      whereCond.name = Like(`%${searchParams.q}%`);
    }

    if (searchParams.examSetId) {
      whereCond.examSetId = searchParams.examSetId;
    }

    if (searchParams.isMiniTest != undefined) {
      whereCond.isMiniTest =
        searchParams.isMiniTest === 'true' || searchParams.isMiniTest === '1';
    }

    if (searchParams.registerTimeFromAfterOrEqual) {
      whereCond.registerStartsAt = MoreThanOrEqual(
        new Date(searchParams.registerTimeFromAfterOrEqual),
      );
    }
    if (searchParams.registerTimeFromBeforeOrEqual) {
      whereCond.registerStartsAt = LessThanOrEqual(
        new Date(searchParams.registerTimeFromAfterOrEqual),
      );
    }

    if (searchParams.registerTimeToAfterOrEqual) {
      whereCond.registerEndsAt = MoreThanOrEqual(
        new Date(searchParams.registerTimeToAfterOrEqual),
      );
    }
    if (searchParams.registerTimeToBeforeOrEqual) {
      whereCond.registerEndsAt = MoreThanOrEqual(
        new Date(searchParams.registerTimeToAfterOrEqual),
      );
    }

    if (searchParams.startTimeAfterOrEqual) {
      whereCond.startsAt = MoreThanOrEqual(
        new Date(searchParams.startTimeAfterOrEqual),
      );
    }

    if (searchParams.startTimeBeforeOrEqual) {
      whereCond.startsAt = LessThanOrEqual(
        new Date(searchParams.startTimeBeforeOrEqual),
      );
    }

    return whereCond;
  }
}
