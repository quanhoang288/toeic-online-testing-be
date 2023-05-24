import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ExamResultEntity } from '../../database/entities/exam-result.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ExamResultDetailEntity } from '../../database/entities/exam-result-detail.entity';
import { QuestionArchiveResultEntity } from '../../database/entities/question-archive-result.entity';
import { QuestionArchiveResultDetailEntity } from '../../database/entities/question-archive-result-detail.entity';
import { ExamDetailEntity } from '../../database/entities/exam-detail.entity';
import { ExamAttemptDto } from './dtos/exam-attempt.dto';
import { QuestionArchiveAttemptDto } from './dtos/question-archive-attempt.dto';
import { QuestionArchiveDetailEntity } from '../../database/entities/question-archive-detail.entity';
import { QuestionEntity } from '../../database/entities/question.entity';
import { QuestionSetEntity } from '../../database/entities/question-set.entity';
import { AttemptResult } from './dtos/attempt-result.dto';

@Injectable()
export class GradingService {
  constructor(
    @InjectRepository(ExamDetailEntity)
    private readonly examDetailRepository: Repository<ExamDetailEntity>,
    @InjectRepository(QuestionArchiveDetailEntity)
    private readonly questionArchiveDetailRepository: Repository<QuestionArchiveDetailEntity>,
    @InjectRepository(ExamResultEntity)
    private readonly examResultRepository: Repository<ExamResultEntity>,
    @InjectRepository(ExamResultDetailEntity)
    private readonly examResultDetailRepository: Repository<ExamResultDetailEntity>,
    @InjectRepository(QuestionArchiveResultEntity)
    private readonly questionArchiveResultRepository: Repository<QuestionArchiveResultEntity>,
    @InjectRepository(QuestionArchiveResultDetailEntity)
    private readonly questionArchiveResultDetailRepository: Repository<QuestionArchiveResultDetailEntity>,
  ) {}

  public async evaluateExamAttempt(
    examAttemptDto: ExamAttemptDto,
  ): Promise<AttemptResult> {
    const { examId, sections } = examAttemptDto;
    const examDetails = await this.examDetailRepository.find({
      where: { examId },
      relations: {
        question: {
          answers: true,
        },
        questionSet: {
          questions: {
            answers: true,
          },
        },
      },
    });
    if (!examDetails.length) {
      throw new BadRequestException('Exam details not found');
    }
    const examAnswersByQuestion =
      this.buildAnswersByQuestionMapping(examDetails);

    let numCorrects = 0;

    const examResultDetails: Partial<ExamResultDetailEntity>[] = [];

    for (const section of sections) {
      const questions = section.questions || [];
      for (const questionAttempt of questions) {
        let isCorrect = false;
        if (
          questionAttempt.selectedAnswerId ===
          examAnswersByQuestion.get(questionAttempt.questionId)
        ) {
          numCorrects++;
          isCorrect = true;
        }

        examResultDetails.push(
          this.examResultDetailRepository.create({
            sectionId: section.sectionId,
            questionId: questionAttempt.questionId,
            selectedAnswerId: questionAttempt.selectedAnswerId,
            isCorrect,
          }),
        );
      }
    }

    const createdExamResult = await this.examResultRepository.save({
      examId,
      accountId: examAttemptDto.accountId,
      isVirtual: false,
      isPartial: examAttemptDto.isPartial || false,
      numCorrects,
      timeTakenInSecs: examAttemptDto.timeTakenInSecs,
    });

    for (const examResultDetail of examResultDetails) {
      examResultDetail.examResultId = createdExamResult.id;
    }
    await this.examResultDetailRepository.save(examResultDetails);

    return { id: createdExamResult.id };
  }

  public async evaluateQuestionArchiveAttempt(
    questionArchiveAttemptDto: QuestionArchiveAttemptDto,
  ): Promise<AttemptResult> {
    const { questionArchiveId, questions } = questionArchiveAttemptDto;
    const questionArchiveDetails =
      await this.questionArchiveDetailRepository.find({
        where: { questionArchiveId },
        relations: {
          question: {
            answers: true,
          },
          questionSet: {
            questions: {
              answers: true,
            },
          },
        },
      });
    if (!questionArchiveDetails.length) {
      throw new BadRequestException('Question archive details not found');
    }
    const answersByQuestion = this.buildAnswersByQuestionMapping(
      questionArchiveDetails,
    );

    let numCorrects = 0;

    const questionArchiveResultDetails: Partial<QuestionArchiveResultDetailEntity>[] =
      [];

    for (const questionAttempt of questions) {
      let isCorrect = false;
      if (
        questionAttempt.selectedAnswerId ===
        answersByQuestion.get(questionAttempt.questionId)
      ) {
        numCorrects++;
        isCorrect = true;
      }

      questionArchiveResultDetails.push(
        this.questionArchiveResultDetailRepository.create({
          questionId: questionAttempt.questionId,
          selectedAnswerId: questionAttempt.selectedAnswerId,
          isCorrect,
        }),
      );
    }

    const createdQuestionArchiveResult =
      await this.questionArchiveResultRepository.save({
        questionArchiveId,
        accountId: questionArchiveAttemptDto.accountId,
        numCorrects,
        timeTakenInSecs: questionArchiveAttemptDto.timeTakenInSecs,
      });

    for (const questionArchiveResultDetail of questionArchiveResultDetails) {
      questionArchiveResultDetail.questionArchiveResultId =
        createdQuestionArchiveResult.id;
    }
    await this.questionArchiveResultDetailRepository.save(
      questionArchiveResultDetails,
    );

    return { id: createdQuestionArchiveResult.id };
  }

  private buildAnswersByQuestionMapping(
    examContent: { question: QuestionEntity; questionSet: QuestionSetEntity }[],
  ): Map<number, number> {
    const answersByQuestion = new Map<number, number>();

    for (const detail of examContent) {
      if (detail.question) {
        answersByQuestion.set(
          detail.question.id,
          detail.question.answers.find((answer) => answer.isCorrect).id,
        );
      } else {
        for (const question of detail.questionSet.questions) {
          answersByQuestion.set(
            question.id,
            question.answers.find((answer) => answer.isCorrect).id,
          );
        }
      }
    }

    return answersByQuestion;
  }
}
