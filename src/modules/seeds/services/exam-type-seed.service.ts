import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import _ from 'lodash';

import { SeedBaseService } from './seed-base.service';
import { ExamTypeEntity } from '../../../database/entities/exam-type.entity';
import { SectionEntity } from '../../../database/entities/section.entity';

import examTypeData from '../data/exam-type.json';

@Injectable()
export class ExamTypeSeedService extends SeedBaseService<ExamTypeEntity> {
  constructor(
    @InjectRepository(ExamTypeEntity)
    examTypeRepository: Repository<ExamTypeEntity>,
  ) {
    super(examTypeRepository);
  }

  public async run(): Promise<void> {
    console.log('running exam type seed service');

    const examTypeRepository = this.getRepository();
    await Promise.all(
      (examTypeData || []).map(async (examType) => {
        const existingExamType = await examTypeRepository.findOneBy({
          name: examType.name,
        });
        if (!existingExamType) {
          const createdExamType = await examTypeRepository.save(
            _.omitBy(examType, ['sections']),
          );
          await examTypeRepository.manager.getRepository(SectionEntity).save(
            (examType.sections || []).map((section) => ({
              ...section,
              examTypeId: createdExamType.id,
            })),
          );
        } else {
          await examTypeRepository.save(
            { id: existingExamType.id },
            _.omitBy(examType, ['sections']),
          );
        }
      }),
    );
    console.log('running exam type seed service done');
    console.log('===================================');
  }
}
