import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import _ from 'lodash';

import { QuestionEntity } from '../../../database/entities/question.entity';
import { AnswerEntity } from '../../../database/entities/answer.entity';
import { QuestionDto } from '../dtos/question.dto';
import { AnswerDto } from '../dtos/answer.dto';
import { AwsS3Service } from '../../../shared/services/aws-s3.service';

@Injectable()
export class QuestionService {
  constructor(
    private readonly s3Service: AwsS3Service,
    @InjectRepository(QuestionEntity)
    private readonly questionRepository: Repository<QuestionEntity>,
    @InjectRepository(AnswerEntity)
    private readonly answerRepository: Repository<AnswerEntity>,
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

    // update audio key
    if (updateDto.imageKey) {
      await this.s3Service.deleteFile(question.imageKey as string);
    }

    await queryRunner.manager
      .getRepository(QuestionEntity)
      .save({ id: questionId, ...updateDto });
  }
}
