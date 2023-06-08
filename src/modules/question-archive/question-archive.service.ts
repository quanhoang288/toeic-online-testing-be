import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Not, QueryRunner, Repository } from 'typeorm';
import { QuestionService } from '../question/services/question.service';
import { QuestionSetService } from '../question/services/question-set.service';
import { IFile } from '../../common/models/IFile';
import { AwsS3Service } from '../../shared/services/aws-s3.service';
import { deleteFileAsync } from '../../common/utils/file-util';
import { TransactionService } from '../../shared/services/transaction.service';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { Order } from '../../common/constants/order';
import { QuestionArchiveDto } from './dtos/question-archive.dto';
import { QuestionArchiveEntity } from '../../database/entities/question-archive.entity';
import { QuestionArchiveDetailEntity } from '../../database/entities/question-archive-detail.entity';
import { QuestionArchiveFilterDto } from './dtos/question-archive-filter.dto';
import { QuestionArchiveAttemptResultDto } from './dtos/question-archive-attempt-result.dto';
import { QuestionArchiveResultEntity } from '../../database/entities/question-archive-result.entity';
import { UserService } from '../user/user.service';
import { QuestionArchiveResultHistoryDto } from './dtos/question-archive-result-history.dto';

@Injectable()
export class QuestionArchiveService {
  constructor(
    private readonly s3Service: AwsS3Service,
    private readonly transactionService: TransactionService,
    private readonly questionService: QuestionService,
    private readonly questionSetService: QuestionSetService,
    private readonly userService: UserService,
    @InjectRepository(QuestionArchiveEntity)
    private readonly questionArchiveRepository: Repository<QuestionArchiveEntity>,
    @InjectRepository(QuestionArchiveDetailEntity)
    private readonly questionArchiveDetailRepository: Repository<QuestionArchiveDetailEntity>,
    @InjectRepository(QuestionArchiveResultEntity)
    private readonly questionArchiveResultRepository: Repository<QuestionArchiveResultEntity>,
  ) {}

  async list(
    searchParams: QuestionArchiveFilterDto,
  ): Promise<PaginationDto<QuestionArchiveDto>> {
    const whereCond = this.parseSearchParams(searchParams);

    const numRecords = await this.questionArchiveRepository.count({
      where: whereCond,
    });

    const questionArchives = await this.questionArchiveRepository.find({
      where: whereCond,
      skip: searchParams.skip,
      take: searchParams.perPage,
      order: {
        id: Order.DESC,
      },
    });

    return {
      page: searchParams.page,
      pageCount: searchParams.perPage,
      totalCount: numRecords,
      data: questionArchives,
    };
  }

  async show(
    questionArchiveId: number,
    accountId?: number,
  ): Promise<QuestionArchiveDto> {
    const questionArchive = await this.questionArchiveRepository.findOne({
      where: { id: questionArchiveId },
      relations: ['section'],
    });
    if (!questionArchive) {
      throw new NotFoundException('Exam not found');
    }
    let questionArchiveResults: QuestionArchiveResultEntity[];
    if (accountId) {
      questionArchiveResults = await this.questionArchiveResultRepository.find({
        where: {
          questionArchiveId,
          accountId,
        },
      });
    }
    const questionArchiveDetails =
      await this.questionArchiveDetailRepository.find({
        where: {
          questionArchiveId,
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

    return {
      ...questionArchive,
      questions: questionArchiveDetails
        .filter((detail) => detail.questionId)
        .sort((d1, d2) => d1.displayOrder - d2.displayOrder)
        .map((detail) => detail.question),
      questionSets: questionArchiveDetails
        .filter((detail) => detail.questionSetId)
        .sort((d1, d2) => d1.displayOrder - d2.displayOrder)
        .map((detail) => detail.questionSet),
      questionArchiveResults,
    };
  }

  async getAttemptResult(
    questionArchiveResultId: number,
  ): Promise<QuestionArchiveAttemptResultDto> {
    const questionArchiveResult =
      await this.questionArchiveResultRepository.findOne({
        where: {
          id: questionArchiveResultId,
        },
        relations: {
          detailResults: true,
        },
      });
    if (!questionArchiveResult) {
      throw new NotFoundException('Question archive result not found');
    }

    const questionArchiveResultsByQuestion = new Map<
      number,
      { selectedAnswerId: number; isCorrect: boolean }
    >();
    for (const detailResult of questionArchiveResult.detailResults || []) {
      questionArchiveResultsByQuestion.set(detailResult.questionId, {
        selectedAnswerId: detailResult.selectedAnswerId,
        isCorrect: detailResult.isCorrect,
      });
    }

    const questionArchiveDetails =
      await this.questionArchiveDetailRepository.find({
        where: {
          questionArchiveId: questionArchiveResult.questionArchiveId,
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

    return {
      id: questionArchiveResultId,
      questionArchiveId: questionArchiveResult.questionArchiveId,
      accountId: questionArchiveResult.accountId,
      numCorrects: questionArchiveResult.numCorrects,
      timeTakenInSecs: questionArchiveResult.timeTakenInSecs,
      questions: questionArchiveDetails
        .filter((detail) => detail.questionId)
        .sort((d1, d2) => d1.displayOrder - d2.displayOrder)
        .map((detail) => ({
          ...detail.question,
          isCorrect:
            questionArchiveResultsByQuestion.get(detail.questionId)
              ?.isCorrect || false,
          selectedAnswerId: questionArchiveResultsByQuestion.get(
            detail.questionId,
          )?.selectedAnswerId,
        })),
      questionSets: questionArchiveDetails
        .filter((detail) => detail.questionSetId)
        .sort((d1, d2) => d1.displayOrder - d2.displayOrder)
        .map((detail) => ({
          ...detail.questionSet,
          questions: detail.questionSet.questions.map((question) => ({
            ...question,
            isCorrect:
              questionArchiveResultsByQuestion.get(question.id)?.isCorrect ||
              false,
            selectedAnswerId: questionArchiveResultsByQuestion.get(question.id)
              ?.selectedAnswerId,
          })),
        })),
    };
  }

  async create(
    questionArchiveDto: Partial<QuestionArchiveDto>,
    assetFiles: {
      audios: IFile[];
      images: IFile[];
    },
  ): Promise<void> {
    console.log('asset files:', assetFiles);
    // Validation
    const existingQuestionArchive =
      await this.questionArchiveRepository.findOneBy({
        name: questionArchiveDto.name,
      });
    if (existingQuestionArchive) {
      throw new BadRequestException(
        'Question archive with name already existed',
      );
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

    const numQuestions =
      (questionArchiveDto.questions?.length || 0) +
      (questionArchiveDto.questionSets || []).reduce(
        (numQuestionsInQuestionSet, curQuestionSet) =>
          numQuestionsInQuestionSet + curQuestionSet.questions.length,
        0,
      );

    const transactionRes = await this.transactionService.runInTransaction(
      async (queryRunner: QueryRunner) => {
        const createdQuestionArchive = await queryRunner.manager
          .getRepository(QuestionArchiveEntity)
          .save({
            name: questionArchiveDto.name,
            sectionId: questionArchiveDto.sectionId,
            numQuestions,
          });

        const questionsToCreate = questionArchiveDto.questions.map(
          (question, questionIdx) => ({
            ...question,
            orderInQuestionSet: question.orderInQuestionSet ?? questionIdx,
            displayOrder: question.displayOrder ?? questionIdx,
            imageKey:
              question.imageFileIndex != undefined &&
              question.imageFileIndex < imageKeys.length
                ? imageKeys[question.imageFileIndex]
                : null,
            audioKey:
              question.audioFileIndex != undefined &&
              question.audioFileIndex < audioKeys.length
                ? audioKeys[question.audioFileIndex]
                : null,
          }),
        );

        const questionSetsToCreate = (
          questionArchiveDto.questionSets ?? []
        ).map((questionSet, questionSetIdx) => ({
          ...questionSet,
          displayOrder:
            questionSet.displayOrder ??
            (questionArchiveDto.questions?.length ?? 0) + questionSetIdx,
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
        }));

        const [createdQuestions, createdQuestionSets] = await Promise.all([
          this.questionService.bulkCreate(questionsToCreate, queryRunner),
          this.questionSetService.bulkCreate(questionSetsToCreate, queryRunner),
        ]);

        // save exam details
        await queryRunner.manager
          .getRepository(QuestionArchiveDetailEntity)
          .save([
            ...createdQuestions.map((questionId, idx) => ({
              questionId,
              questionArchiveId: createdQuestionArchive.id,
              displayOrder: questionsToCreate[idx].displayOrder,
            })),
            ...createdQuestionSets.map((questionSetId, idx) => ({
              questionSetId,
              questionArchiveId: createdQuestionArchive.id,
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
    questionArchiveId: number,
    updateData: Partial<QuestionArchiveDto>,
    assetFiles?: {
      audios: IFile[];
      images: IFile[];
    },
  ): Promise<void> {
    const questionArchive = await this.questionArchiveRepository.findOneBy({
      id: questionArchiveId,
    });
    if (!questionArchive) {
      throw new BadRequestException('Question archive not found');
    }

    // Validation
    const existingQuestionArchive =
      await this.questionArchiveRepository.findOneBy({
        name: updateData.name,
        id: Not(questionArchiveId),
      });
    if (existingQuestionArchive) {
      throw new BadRequestException(
        'Quesetion archive with name already existed',
      );
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
        await queryRunner.manager.getRepository(QuestionArchiveEntity).save({
          id: questionArchiveId,
          name: updateData.name,
          sectionId: updateData.sectionId,
        });

        await Promise.all([
          ...(updateData.questions || []).map((question) =>
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

          ...(updateData.questionSets || []).map((questionSet) =>
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

  async delete(questionArchiveId: number): Promise<void> {
    const questionArchive = await this.questionArchiveRepository.findOneBy({
      id: questionArchiveId,
    });
    if (!questionArchive) {
      throw new BadRequestException('Question archive not found');
    }

    await this.questionArchiveRepository.softDelete(questionArchiveId);
  }

  async getResultHistories(
    accountId: number,
  ): Promise<QuestionArchiveResultHistoryDto[]> {
    const user = await this.userService.findOneById(accountId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const questionArchiveResults =
      await this.questionArchiveResultRepository.find({
        where: {
          accountId,
        },
        relations: ['questionArchive'],
        order: {
          id: Order.DESC,
        },
      });

    return questionArchiveResults.map((result) => ({
      questionArchiveResultId: result.id,
      questionArchiveId: result.questionArchiveId,
      questionArchiveName: result.questionArchive.name,
      numCorrects: result.numCorrects,
      totalQuestions: result.questionArchive.numQuestions,
      timeTakenInSecs: result.timeTakenInSecs,
      createdAt: result.createdAt,
    }));
  }

  private parseSearchParams(
    searchParams: QuestionArchiveFilterDto,
  ): FindOptionsWhere<QuestionArchiveEntity> {
    const whereCond: FindOptionsWhere<QuestionArchiveEntity> = {};

    if (searchParams.q) {
      whereCond.name = Like(`%${searchParams}%`);
    }

    if (searchParams.sectionId) {
      whereCond.sectionId = searchParams.sectionId;
    }

    return whereCond;
  }
}
