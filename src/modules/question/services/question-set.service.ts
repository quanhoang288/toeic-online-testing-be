import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionSetEntity } from '../../../database/entities/question-set.entity';
import { QuestionSetDto } from '../dtos/question-set.dto';
import { QuestionService } from './question.service';

@Injectable()
export class QuestionSetService {
  constructor(
    @InjectRepository(QuestionSetEntity)
    private readonly questionSetRepository: Repository<QuestionSetEntity>,
    private readonly questionService: QuestionService,
  ) {}

  async bulkCreate(
    questionSetDtos: QuestionSetDto[],
  ): Promise<{ examSectionId?: number; questionSetId: number }[]> {
    // TODO: put audio file to S3

    const questionSetsOnlyData = questionSetDtos.map((questionSet) => ({
      title: questionSet.title,
      textContent: questionSet.textContent,
      audioUrl: null,
    }));
    const createdQuestionSets = await this.questionSetRepository.save(
      questionSetsOnlyData,
    );

    const questionsToCreate = createdQuestionSets.reduce(
      (questions, curQuestionSet, idx) =>
        questions.concat(
          questionSetDtos[idx].questions.map((question) => ({
            ...question,
            questionSetId: curQuestionSet.id,
          })),
        ),
      [],
    );

    await this.questionService.bulkCreate(questionsToCreate);

    return createdQuestionSets.map((questionSet, idx) => ({
      examSectionId: questionSetDtos[idx].examSectionId,
      questionSetId: questionSet.id,
    }));
  }
}
