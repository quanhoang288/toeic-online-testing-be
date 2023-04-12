import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionEntity } from '../../../database/entities/question.entity';
import { Repository } from 'typeorm';
import { AnswerEntity } from '../../../database/entities/answer.entity';
import { QuestionDto } from '../dtos/question.dto';
import { AnswerDto } from '../dtos/answer.dto';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionRepository: Repository<QuestionEntity>,
    @InjectRepository(AnswerEntity)
    private readonly answerRepository: Repository<AnswerEntity>,
  ) {}

  async bulkCreate(
    questionDtos: QuestionDto[],
  ): Promise<{ examSectionId?: number; questionId: number }[]> {
    // TODO: put audio file to S3

    // persist question and answer data to DB
    const questionsOnly = questionDtos.map((question) => ({
      type: question.type,
      text: question.text,
      imageUrl: null,
      explanation: question.explanation,
      questionSetId: question.questionSetId,
    }));
    const createdQuestions = await this.questionRepository.save(questionsOnly);

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
    await this.answerRepository.save(answers);

    return createdQuestions.map((question, idx) => ({
      examSectionId: questionDtos[idx].examSectionId,
      questionId: question.id,
    }));
  }
}
