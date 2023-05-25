import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, QueryRunner, Repository } from 'typeorm';
import _ from 'lodash';
import { QuestionSetEntity } from '../../../database/entities/question-set.entity';
import { QuestionSetDto } from '../dtos/question-set.dto';
import { QuestionService } from './question.service';
import { QuestionSetImageEntity } from '../../../database/entities/question-set-image.entity';
import { AwsS3Service } from '../../../shared/services/aws-s3.service';
import { QuestionArchiveDetailEntity } from '../../../database/entities/question-archive-detail.entity';
import { QuestionEntity } from '../../../database/entities/question.entity';
import { ExamDetailEntity } from '../../../database/entities/exam-detail.entity';

@Injectable()
export class QuestionSetService {
  constructor(
    private readonly s3Service: AwsS3Service,
    @InjectRepository(QuestionSetEntity)
    private readonly questionSetRepository: Repository<QuestionSetEntity>,
    @InjectRepository(QuestionSetImageEntity)
    private readonly questionSetImageRepository: Repository<QuestionSetImageEntity>,
    private readonly questionService: QuestionService,
    @InjectRepository(ExamDetailEntity)
    private readonly examDetailRepository: Repository<ExamDetailEntity>,
    @InjectRepository(QuestionArchiveDetailEntity)
    private readonly questionArchiveDetailRepository: Repository<QuestionArchiveDetailEntity>,
  ) {}

  async bulkCreate(
    questionSetDtos: QuestionSetDto[],
    queryRunner?: QueryRunner,
  ): Promise<number[]> {
    const questionSetsOnlyData = questionSetDtos.map((questionSet) => ({
      content: questionSet.content,
      audioKey: questionSet.audioKey,
    }));
    const createdQuestionSets = queryRunner
      ? await queryRunner.manager
          .getRepository(QuestionSetEntity)
          .save(questionSetsOnlyData)
      : await this.questionSetRepository.save(questionSetsOnlyData);

    if (queryRunner) {
      await queryRunner.manager.getRepository(QuestionSetImageEntity).save(
        questionSetDtos.reduce(
          (questionSetImagesToCreate, curQuestionSetDto, idx) => {
            const imageKeys = curQuestionSetDto.imageKeys || [];
            return questionSetImagesToCreate.concat(
              imageKeys.map((imageKey) => ({
                imageKey,
                questionSetId: createdQuestionSets[idx].id,
              })),
            );
          },
          [],
        ),
      );
    } else {
      await this.questionSetImageRepository.save(
        questionSetDtos.reduce(
          (questionSetImagesToCreate, curQuestionSetDto, idx) => {
            const imageKeys = curQuestionSetDto.imageKeys || [];
            return questionSetImagesToCreate.concat(
              imageKeys.map((imageKey) => ({
                imageKey,
                questionSetId: createdQuestionSets[idx].id,
              })),
            );
          },
          [],
        ),
      );
    }

    const questionsToCreate = createdQuestionSets.reduce(
      (questions, curQuestionSet, idx) =>
        questions.concat(
          questionSetDtos[idx].questions.map((question, idx) => ({
            ...question,
            orderInQuestionSet: question.orderInQuestionSet ?? idx,
            questionSetId: curQuestionSet.id,
          })),
        ),
      [],
    );
    await this.questionService.bulkCreate(questionsToCreate, queryRunner);

    return createdQuestionSets.map((questionSet) => questionSet.id);
  }

  async update(
    questionSetId: number,
    updateDto: Partial<QuestionSetDto>,
    queryRunner?: QueryRunner,
  ): Promise<void> {
    const questionSet = await queryRunner.manager
      .getRepository(QuestionSetEntity)
      .findOne({ where: { id: questionSetId }, relations: ['images'] });
    if (!questionSet) {
      return;
    }

    const questionSetOnlyData = _.omitBy(
      _.pick(updateDto, ['title', 'content', 'audioKey']),
      _.isEmpty,
    );
    if (updateDto.imageKeys && questionSet.images.length) {
      await Promise.all([
        ...questionSet.images.map((image) =>
          this.s3Service.deleteFile(image.imageKey as string),
        ),
        queryRunner.manager.getRepository(QuestionSetImageEntity).delete({
          id: In(questionSet.images.map((image) => image.id)),
        }),
      ]);
    }
    if (updateDto.audioKey && questionSet.audioKey) {
      await this.s3Service.deleteFile(questionSet.audioKey as string);
    }

    const updateImageKeys = updateDto.imageKeys ?? [];
    const imageKeysToCreate = updateImageKeys.filter(
      (key) =>
        !questionSet.images.some(
          (existingImage) => existingImage.imageKey === key,
        ),
    );

    await Promise.all([
      queryRunner.manager.getRepository(QuestionSetEntity).save({
        id: questionSetId,
        ...questionSetOnlyData,
      }),
      queryRunner.manager.getRepository(QuestionSetImageEntity).save(
        imageKeysToCreate.map((key) => ({
          questionSetId,
          imageKey: key,
        })),
      ),
      ...updateDto.questions.map((question) =>
        this.questionService.update(question.id, question, queryRunner),
      ),
    ]);
  }

  async bulkDeleteFromExam(
    questionSetIds: number[],
    examId: number,
    queryRunner?: QueryRunner,
  ): Promise<void> {
    if (queryRunner) {
      await queryRunner.manager.getRepository(ExamDetailEntity).delete({
        examId,
        questionId: In(questionSetIds),
      });
      await queryRunner.manager.getRepository(QuestionEntity).delete({
        id: In(questionSetIds),
      });
    } else {
      await this.examDetailRepository.manager.transaction(async (manager) => {
        await manager.getRepository(ExamDetailEntity).delete({
          examId,
          questionId: In(questionSetIds),
        });
        await manager.getRepository(QuestionSetEntity).delete({
          id: In(questionSetIds),
        });
      });
    }
  }

  async bulkDeleteFromQuestionArchive(
    questionSetIds: number[],
    questionArchiveId: number,
    queryRunner?: QueryRunner,
  ): Promise<void> {
    if (queryRunner) {
      await queryRunner.manager
        .getRepository(QuestionArchiveDetailEntity)
        .delete({
          questionArchiveId,
          questionSetId: In(questionSetIds),
        });
      await queryRunner.manager.getRepository(QuestionSetEntity).delete({
        id: In(questionSetIds),
      });
    } else {
      await this.questionArchiveDetailRepository.manager.transaction(
        async (manager) => {
          await manager.getRepository(QuestionArchiveDetailEntity).delete({
            questionArchiveId,
            questionSetId: In(questionSetIds),
          });
          await manager.getRepository(QuestionSetEntity).delete({
            id: In(questionSetIds),
          });
        },
      );
    }
  }
}
