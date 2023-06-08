import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, QueryRunner, Repository } from 'typeorm';
import _ from 'lodash';

import { QuestionEntity } from '../../../database/entities/question.entity';
import { AnswerEntity } from '../../../database/entities/answer.entity';
import { QuestionDto } from '../dtos/question.dto';
import { AnswerDto } from '../dtos/answer.dto';
import { AwsS3Service } from '../../../shared/services/aws-s3.service';
import { ExamDetailEntity } from '../../../database/entities/exam-detail.entity';
import { QuestionArchiveDetailEntity } from '../../../database/entities/question-archive-detail.entity';

@Injectable()
export class QuestionService {
  constructor(
    private readonly s3Service: AwsS3Service,
    @InjectRepository(QuestionEntity)
    private readonly questionRepository: Repository<QuestionEntity>,
    @InjectRepository(AnswerEntity)
    private readonly answerRepository: Repository<AnswerEntity>,
    @InjectRepository(ExamDetailEntity)
    private readonly examDetailRepository: Repository<ExamDetailEntity>,
    @InjectRepository(QuestionArchiveDetailEntity)
    private readonly questionArchiveDetailRepository: Repository<QuestionArchiveDetailEntity>,
  ) {}

  async bulkCreate(
    questionDtos: QuestionDto[],
    queryRunner?: QueryRunner,
  ): Promise<number[]> {
    // persist question and answer data to DB
    const questionsOnly = questionDtos.map((question) =>
      _.pick(question, [
        'type',
        'content',
        'imageKey',
        'audioKey',
        'explanation',
        'questionSetId',
        'orderInQuestionSet',
      ]),
    );
    const createdQuestions = queryRunner
      ? await queryRunner.manager
          .getRepository(QuestionEntity)
          .save(questionsOnly)
      : await this.questionRepository.save(questionsOnly);

    const answers = createdQuestions.reduce(
      (answers: AnswerDto[], curQuestion: QuestionEntity, idx: number) => {
        const questionAnswers = questionDtos[idx].answers;
        return answers.concat(
          questionAnswers.map((answer) => ({
            ...answer,
            questionId: curQuestion.id,
          })),
        );
      },
      [],
    );

    if (queryRunner) {
      await queryRunner.manager.getRepository(AnswerEntity).save(answers);
    } else {
      await this.answerRepository.save(answers);
    }

    return createdQuestions.map((question) => question.id);
  }

  async update(
    questionId: number,
    updateDto: Partial<QuestionDto>,
    queryRunner?: QueryRunner,
  ): Promise<void> {
    const question = await queryRunner.manager
      .getRepository(QuestionEntity)
      .findOne({ where: { id: questionId } });
    if (!question) {
      return;
    }

    if (updateDto.imageKey && question.imageKey) {
      await this.s3Service.deleteFile(question.imageKey as string);
    }
    if (updateDto.audioKey && question.audioKey) {
      await this.s3Service.deleteFile(question.audioKey as string);
    }

    await queryRunner.manager.getRepository(QuestionEntity).save({
      id: questionId,
      ..._.omitBy(
        _.pick(updateDto, [
          'content',
          'audioKey',
          'imageKey',
          'questionSetId',
          'orderInQuestionSet',
          'explanation',
        ]),
        _.isNil,
      ),
    });

    await Promise.all(
      (updateDto.answers || []).map((answer) =>
        queryRunner?.manager.getRepository(AnswerEntity).save(answer),
      ),
    );
  }

  async bulkDeleteFromExam(
    questionIds: number[],
    examId: number,
    queryRunner?: QueryRunner,
  ): Promise<void> {
    if (queryRunner) {
      await queryRunner.manager.getRepository(ExamDetailEntity).delete({
        examId,
        questionId: In(questionIds),
      });
      await queryRunner.manager.getRepository(QuestionEntity).delete({
        id: In(questionIds),
      });
    } else {
      await this.examDetailRepository.manager.transaction(async (manager) => {
        await manager.getRepository(ExamDetailEntity).delete({
          examId,
          questionId: In(questionIds),
        });
        await manager.getRepository(QuestionEntity).delete({
          id: In(questionIds),
        });
      });
    }
  }

  async bulkDeleteFromQuestionArchive(
    questionIds: number[],
    questionArchiveId: number,
    queryRunner?: QueryRunner,
  ): Promise<void> {
    if (queryRunner) {
      await queryRunner.manager
        .getRepository(QuestionArchiveDetailEntity)
        .delete({
          questionArchiveId,
          questionId: In(questionIds),
        });
      await queryRunner.manager.getRepository(QuestionEntity).delete({
        id: In(questionIds),
      });
    } else {
      await this.questionArchiveDetailRepository.manager.transaction(
        async (manager) => {
          await manager.getRepository(QuestionArchiveDetailEntity).delete({
            questionArchiveId,
            questionId: In(questionIds),
          });
          await manager.getRepository(QuestionEntity).delete({
            id: In(questionIds),
          });
        },
      );
    }
  }
}
