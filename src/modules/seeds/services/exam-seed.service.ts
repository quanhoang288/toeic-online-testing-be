import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';

import { SeedBaseService } from './seed-base.service';

import { ExamEntity } from '../../../database/entities/exam.entity';
import { QuestionDto } from '../../question/dtos/question.dto';
import { QuestionSetDto } from '../../question/dtos/question-set.dto';
import { ExamTypeEntity } from '../../../database/entities/exam-type.entity';
import { ExamType } from '../../../common/constants/exam-type';
import { ExamScope } from '../../../common/constants/exam-scope';
import { ExamDetailEntity } from '../../../database/entities/exam-detail.entity';
import { TransactionService } from '../../../shared/services/transaction.service';
import { QuestionService } from '../../question/services/question.service';
import { QuestionSetService } from '../../question/services/question-set.service';
import { randomInt } from 'crypto';

const IMAGE_SEED_KEY_1 = 'images/seed_image_1.webp';
const AUDIO_SEED_KEY_1 = 'audios/seed_audio_1.mp3';

@Injectable()
export class ExamSeedService extends SeedBaseService<ExamEntity> {
  constructor(
    @InjectRepository(ExamEntity)
    examRepository: Repository<ExamEntity>,
    @InjectRepository(ExamTypeEntity)
    private readonly examTypeRepository: Repository<ExamTypeEntity>,
    private readonly transactionService: TransactionService,
    private readonly questionService: QuestionService,
    private readonly questionSetService: QuestionSetService,
  ) {
    super(examRepository);
  }

  public async run(): Promise<void> {
    console.log('running exam seed service');

    const toeicType = await this.examTypeRepository.findOne({
      where: {
        name: ExamType.TOEIC,
      },
      relations: ['sections'],
    });
    await this.transactionService.runInTransaction(async (queryRunner) => {
      for (let i = 0; i < 5; i++) {
        await this.createSeedToeicExam(toeicType, queryRunner);
      }
    });

    console.log('running exam seed service done');
    console.log('==============================');
  }

  private async createSeedToeicExam(
    toeicType: ExamTypeEntity,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const part1Data: QuestionDto[] = [];
    const part2Data: QuestionDto[] = [];
    const part3Data: QuestionSetDto[] = [];
    const part4Data: QuestionSetDto[] = [];
    const part5Data: QuestionDto[] = [];
    const part6Data: QuestionSetDto[] = [];
    const part7Data: QuestionSetDto[] = [];

    // part 1
    for (let i = 0; i < 6; i++) {
      const correctAnsIdx = randomInt(4);
      part1Data.push({
        type: 'multiple_choice',
        answers: Array(4)
          .fill({
            content: faker.lorem.sentence(),
          })
          .map((a, idx) => ({ ...a, isCorrect: correctAnsIdx === idx })),
        imageKey: IMAGE_SEED_KEY_1,
        audioKey: AUDIO_SEED_KEY_1,
      });
    }

    // part 2
    for (let i = 0; i < 25; i++) {
      const correctAnsIdx = randomInt(3);
      part2Data.push({
        type: 'multiple_choice',
        content: faker.lorem.sentence(),
        answers: Array(3)
          .fill({
            content: faker.lorem.sentence(),
          })
          .map((a, idx) => ({ ...a, isCorrect: correctAnsIdx === idx })),
        audioKey: AUDIO_SEED_KEY_1,
      });
    }

    // part 3
    for (let i = 0; i < 13; i++) {
      const correctAnsIdx = randomInt(4);
      part3Data.push({
        content: faker.lorem.sentences(6),
        questions: Array(3).fill({
          content: `${faker.hacker.phrase()} ${faker.hacker.verb()} ${faker.hacker.noun()}?`,
          answers: Array(4)
            .fill({
              content: faker.lorem.sentence(),
            })
            .map((a, idx) => ({ ...a, isCorrect: correctAnsIdx === idx })),
          audioKey: AUDIO_SEED_KEY_1,
        }),
      });
    }

    // part 4
    for (let i = 0; i < 10; i++) {
      const correctAnsIdx = randomInt(4);
      part4Data.push({
        content: faker.lorem.sentences({ min: 4, max: 6 }),
        questions: Array(3).fill({
          content: `${faker.hacker.phrase()} ${faker.hacker.verb()} ${faker.hacker.noun()}?`,
          answers: Array(4)
            .fill({
              content: faker.lorem.sentence(),
            })
            .map((a, idx) => ({ ...a, isCorrect: correctAnsIdx === idx })),
          audioKey: AUDIO_SEED_KEY_1,
        }),
      });
    }

    // part 5
    for (let i = 0; i < 30; i++) {
      const correctAnsIdx = randomInt(4);
      part5Data.push({
        type: 'multiple_choice',
        content: faker.lorem.sentence(),
        answers: Array(4)
          .fill({
            content: faker.lorem.word(),
          })
          .map((a, idx) => ({ ...a, isCorrect: correctAnsIdx === idx })),
      });
    }

    // part 6
    for (let i = 0; i < 4; i++) {
      const correctAnsIdx = randomInt(4);
      part6Data.push({
        content: faker.lorem.sentences({ min: 10, max: 20 }, '\n'),
        questions: Array(4).fill({
          type: 'multiple_choice',
          answers: Array(4)
            .fill({
              content: faker.lorem.words({ min: 1, max: 8 }),
            })
            .map((a, idx) => ({ ...a, isCorrect: correctAnsIdx === idx })),
        }),
      });
    }

    // part 7
    for (let i = 0; i < 18; i++) {
      const correctAnsIdx = randomInt(4);
      part7Data.push({
        content: `${faker.hacker.phrase()} ${faker.hacker.verb()} ${faker.hacker.noun()}?`,
        questions: Array(3).fill({
          type: 'multiple_choice',
          content: faker.lorem.sentence(),
          answers: Array(4)
            .fill({
              content: faker.lorem.words({ min: 1, max: 8 }),
            })
            .map((a, idx) => ({ ...a, isCorrect: correctAnsIdx === idx })),
        }),
      });
    }

    const createdExam = await queryRunner.manager
      .getRepository(ExamEntity)
      .save({
        name: `TOEIC ${faker.word.sample()} - ${uuidv4()}`,
        examTypeId: toeicType.id,
        accessScope: ExamScope.PUBLIC,
      });

    // part 1
    const part1QuestionIds = await this.questionService.bulkCreate(
      part1Data,
      queryRunner,
    );
    await queryRunner.manager.getRepository(ExamDetailEntity).save(
      part1QuestionIds.map((questionId, idx) => ({
        examId: createdExam.id,
        sectionId: toeicType.sections.find(
          (section) => section.name === 'part1',
        ).id,
        displayOrder: idx,
        questionId,
      })),
    );

    // part 2
    const part2QuestionIds = await this.questionService.bulkCreate(
      part2Data,
      queryRunner,
    );
    await queryRunner.manager.getRepository(ExamDetailEntity).save(
      part2QuestionIds.map((questionId, idx) => ({
        examId: createdExam.id,
        sectionId: toeicType.sections.find(
          (section) => section.name === 'part2',
        ).id,
        displayOrder: 7 + idx,
        questionId,
      })),
    );

    // part 3
    const part3QuestionSetIds = await this.questionSetService.bulkCreate(
      part3Data,
      queryRunner,
    );
    await queryRunner.manager.getRepository(ExamDetailEntity).save(
      part3QuestionSetIds.map((questionSetId, idx) => ({
        examId: createdExam.id,
        sectionId: toeicType.sections.find(
          (section) => section.name === 'part3',
        ).id,
        displayOrder: 32 + idx,
        questionSetId,
      })),
    );

    // part 4
    const part4QuestionSetIds = await this.questionSetService.bulkCreate(
      part4Data,
      queryRunner,
    );
    await queryRunner.manager.getRepository(ExamDetailEntity).save(
      part4QuestionSetIds.map((questionSetId, idx) => ({
        examId: createdExam.id,
        sectionId: toeicType.sections.find(
          (section) => section.name === 'part4',
        ).id,
        questionSetId,
        displayOrder: 70 + idx,
      })),
    );

    // part 5
    const part5QuestionIds = await this.questionService.bulkCreate(
      part5Data,
      queryRunner,
    );
    await queryRunner.manager.getRepository(ExamDetailEntity).save(
      part5QuestionIds.map((questionId, idx) => ({
        examId: createdExam.id,
        sectionId: toeicType.sections.find(
          (section) => section.name === 'part5',
        ).id,
        questionId,
        displayOrder: 101 + idx,
      })),
    );

    // part 6
    const part6QuestionSetIds = await this.questionSetService.bulkCreate(
      part6Data,
      queryRunner,
    );
    await queryRunner.manager.getRepository(ExamDetailEntity).save(
      part6QuestionSetIds.map((questionSetId, idx) => ({
        examId: createdExam.id,
        sectionId: toeicType.sections.find(
          (section) => section.name === 'part6',
        ).id,
        questionSetId,
        displayOrder: 131 + idx,
      })),
    );

    // part 7
    const part7QuestionSetIds = await this.questionSetService.bulkCreate(
      part7Data,
      queryRunner,
    );
    await queryRunner.manager.getRepository(ExamDetailEntity).save(
      part7QuestionSetIds.map((questionSetId, idx) => ({
        examId: createdExam.id,
        sectionId: toeicType.sections.find(
          (section) => section.name === 'part7',
        ).id,
        questionSetId,
        displayOrder: 147 + idx,
      })),
    );
  }
}
