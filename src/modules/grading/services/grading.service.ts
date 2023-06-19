import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { ExamResultEntity } from '../../../database/entities/exam-result.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ExamResultDetailEntity } from '../../../database/entities/exam-result-detail.entity';
import { QuestionArchiveResultEntity } from '../../../database/entities/question-archive-result.entity';
import { QuestionArchiveResultDetailEntity } from '../../../database/entities/question-archive-result-detail.entity';
import { ExamDetailEntity } from '../../../database/entities/exam-detail.entity';
import { ExamAttemptDto } from '../dtos/exam-attempt.dto';
import { QuestionArchiveAttemptDto } from '../dtos/question-archive-attempt.dto';
import { QuestionArchiveDetailEntity } from '../../../database/entities/question-archive-detail.entity';
import { QuestionEntity } from '../../../database/entities/question.entity';
import { QuestionSetEntity } from '../../../database/entities/question-set.entity';
import { AttemptResult } from '../dtos/attempt-result.dto';
import { ExamEntity } from '../../../database/entities/exam.entity';
import { UserService } from '../../user/user.service';
import { TransactionService } from '../../../shared/services/transaction.service';
import { PointConversionService } from './point-conversion.service';
import { ExamType } from '../../../common/constants/exam-type';
import { SectionType } from '../../../common/constants/section-type';
import { SectionEntity } from '../../../database/entities/section.entity';
import { ExamResultBySectionEntity } from '../../../database/entities/exam-result-by-section.entity';

@Injectable()
export class GradingService {
  constructor(
    private readonly userService: UserService,
    private readonly transactionService: TransactionService,
    private readonly pointConversionService: PointConversionService,
    @InjectRepository(ExamEntity)
    private readonly examRepository: Repository<ExamEntity>,
    @InjectRepository(ExamDetailEntity)
    private readonly examDetailRepository: Repository<ExamDetailEntity>,
    @InjectRepository(SectionEntity)
    private readonly sectionRepository: Repository<SectionEntity>,
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
    userId: number,
  ): Promise<AttemptResult> {
    const { examId, sections } = examAttemptDto;
    const exam = await this.examRepository.findOneBy({ id: examId });
    if (!exam) {
      throw new BadRequestException('Exam not found');
    }
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const sectionData = await this.sectionRepository.find({
      where: {
        id: In(sections.map((section) => section.sectionId)),
      },
    });

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

    const examResultsBySection: {
      numCorrects: number;
      sectionId: number;
      sectionType: SectionType;
    }[] = [];

    const examResultDetails: Partial<ExamResultDetailEntity>[] = [];

    for (const [idx, section] of sections.entries()) {
      const questions = section.questions || [];
      let numCorrectQuestionsInSection = 0;
      for (const questionAttempt of questions) {
        let isCorrect = false;
        if (
          questionAttempt.selectedAnswerId ===
          examAnswersByQuestion.get(questionAttempt.questionId)
        ) {
          numCorrects++;
          numCorrectQuestionsInSection++;
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
      examResultsBySection.push({
        sectionId: section.sectionId,
        sectionType: sectionData[idx].type,
        numCorrects: numCorrectQuestionsInSection,
      });
    }

    const convertedPointRes = !exam.isMiniTest
      ? this.convertResultToExamPoints(ExamType.TOEIC, examResultsBySection)
      : {};

    let createdExamResult: ExamResultEntity;

    await this.transactionService.runInTransaction(async (queryRunner) => {
      createdExamResult = await queryRunner.manager
        .getRepository(ExamResultEntity)
        .save({
          examId,
          accountId: userId,
          isVirtual: false,
          isPartial: examAttemptDto.isPartial || false,
          numCorrects,
          timeTakenInSecs: examAttemptDto.timeTakenInSecs,
          ...convertedPointRes,
        });
      await queryRunner.manager.getRepository(ExamResultBySectionEntity).save(
        examResultsBySection.map((resultBySection) => ({
          examResultId: createdExamResult.id,
          sectionId: resultBySection.sectionId,
          numCorrects: resultBySection.numCorrects,
        })),
      );

      for (const examResultDetail of examResultDetails) {
        examResultDetail.examResultId = createdExamResult.id;
      }
      await queryRunner.manager
        .getRepository(ExamResultDetailEntity)
        .save(examResultDetails);
      await queryRunner.manager
        .getRepository(ExamEntity)
        .save({ id: exam.id, numParticipants: exam.numParticipants + 1 });
    });

    if (!createdExamResult) {
      throw new InternalServerErrorException('Error grading exam');
    }

    return { id: createdExamResult.id };
  }

  public async evaluateQuestionArchiveAttempt(
    questionArchiveAttemptDto: QuestionArchiveAttemptDto,
    accountId: number,
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
    const user = await this.userService.findOneById(accountId);
    if (!user) {
      throw new BadRequestException('User not found');
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
        accountId,
        numCorrects,
        timeTakenInSecs: questionArchiveAttemptDto.timeTakenInSecs || 0,
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
      } else if (detail.questionSet) {
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

  private convertResultToExamPoints(
    examType: ExamType,
    resultsBySection: {
      numCorrects: number;
      sectionId: number;
      sectionType: SectionType;
    }[],
  ): { listeningPoints: number; readingPoints: number; totalPoints: number } {
    if (examType === ExamType.TOEIC) {
      let numCorrectListeningQuestions = 0;
      let numCorrectReadingQuestions = 0;
      for (const sectionResult of resultsBySection) {
        if (sectionResult.sectionType === SectionType.LISTENING) {
          numCorrectListeningQuestions += sectionResult.numCorrects;
        } else {
          numCorrectReadingQuestions += sectionResult.numCorrects;
        }
      }

      const listeningPoints =
        this.pointConversionService.TOEIC_POINT_CONVERSION.listening.get(
          numCorrectListeningQuestions,
        );
      const readingPoints =
        this.pointConversionService.TOEIC_POINT_CONVERSION.reading.get(
          numCorrectReadingQuestions,
        );

      return {
        listeningPoints,
        readingPoints,
        totalPoints: listeningPoints + readingPoints,
      };
    } else {
      throw new InternalServerErrorException('Not implemented');
    }
  }
}
