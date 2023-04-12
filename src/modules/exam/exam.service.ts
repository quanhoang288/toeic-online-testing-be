import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamDto } from './dtos/exam.dto';
import { ExamEntity } from '../../database/entities/exam.entity';
import { ExamDetailEntity } from '../../database/entities/exam-detail.entity';
import { QuestionService } from '../question/services/question.service';
import { SectionEntity } from '../../database/entities/section.entity';
import { ExamSectionEntity } from '../../database/entities/exam-section.entity';
import { QuestionDto } from '../question/dtos/question.dto';
import { QuestionSetService } from '../question/services/question-set.service';
import { QuestionSetDto } from '../question/dtos/question-set.dto';

@Injectable()
export class ExamService {
  constructor(
    private readonly questionService: QuestionService,
    private readonly questionSetService: QuestionSetService,
    @InjectRepository(ExamEntity)
    private readonly examRepository: Repository<ExamEntity>,
    @InjectRepository(ExamDetailEntity)
    private readonly examDetailRepository: Repository<ExamDetailEntity>,
    @InjectRepository(SectionEntity)
    private readonly sectionRepository: Repository<SectionEntity>,
    @InjectRepository(ExamSectionEntity)
    private readonly examSectionRepository: Repository<ExamSectionEntity>,
  ) {}

  async create(examDto: ExamDto): Promise<number> {
    // TODO: put audio file to S3 and get url of uploaded file

    // TODO: validate each section size matching with number of questions in question lists

    const exam = this.examRepository.create({
      name: examDto.name,
      type: examDto.type,
      hasMultipleSections: examDto.hasMultipleSections ?? true,
      timeLimitInMins: examDto.timeLimitInMins,
      registerStartsAt: examDto.registerStartsAt,
      registerEndsAt: examDto.registerEndsAt,
      startsAt: examDto.startsAt,
      audio: null,
      examSetId: examDto.examSet as number,
    });
    const createdExam = await exam.save();

    const sections = await Promise.all(
      examDto.sections.map(async (section) => {
        const existingSection = await this.sectionRepository.findOneBy({
          name: section.name,
        });
        if (existingSection) {
          return existingSection;
        }

        return this.sectionRepository.save({
          name: section.name,
          numQuestions: section.numQuestions,
        });
      }),
    );

    // save mapping of exam and sections
    const createdExamSections = await this.examSectionRepository.save(
      sections.map((section) => ({
        examId: createdExam.id,
        sectionId: section.id,
        sectionName: section.name,
      })),
    );

    // save questions and mapping with sections
    const questionsToCreate = examDto.sections.reduce<QuestionDto[]>(
      (questions, sectionData, idx) => {
        const examSection = createdExamSections[idx];
        return questions.concat(
          sectionData.questions.map((question) => ({
            ...question,
            examSectionId: examSection.id,
          })),
        );
      },
      [],
    );

    const questionSetsToCreate = examDto.sections.reduce<QuestionSetDto[]>(
      (questionSets, sectionData, idx) => {
        const examSection = createdExamSections[idx];
        return questionSets.concat(
          sectionData.questionSets.map((questionSet) => ({
            ...questionSet,
            examSectionId: examSection.id,
          })),
        );
      },
      [],
    );

    const [createdQuestions, createdQuestionSets] = await Promise.all([
      this.questionService.bulkCreate(questionsToCreate),
      this.questionSetService.bulkCreate(questionSetsToCreate),
    ]);

    // save exam details
    await this.examDetailRepository.save([
      ...createdQuestions.map((question) => ({
        ...question,
        examId: createdExam.id,
      })),
      ...createdQuestionSets.map((questionSet) => ({
        ...questionSet,
        examId: createdExam.id,
      })),
    ]);

    return createdExam.id;
  }
}
