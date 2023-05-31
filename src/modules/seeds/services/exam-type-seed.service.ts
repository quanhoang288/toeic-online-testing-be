import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import _ from 'lodash';

import { SeedBaseService } from './seed-base.service';
import { ExamTypeEntity } from 'src/database/entities/exam-type.entity';
import { SectionEntity } from 'src/database/entities/section.entity';

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
    const examTypeRepository = this.getRepository();
    await Promise.all(
      (examTypeData || []).map(async (examType) => {
        let examTypeEntity = await examTypeRepository.findOneBy({
          name: examType.name,
        });
        if (!examTypeEntity) {
          examTypeEntity = await examTypeRepository.save(
            _.omitBy(examType, ['sections']),
          );
        }
        const sectionRepository =
          examTypeRepository.manager.getRepository(SectionEntity);
        await sectionRepository.upsert(
          (examType.sections || []).map((section) =>
            sectionRepository.create({
              ...section,
              examTypeId: examTypeEntity.id,
            }),
          ),
          {
            conflictPaths: ['name'],
          },
        );
      }),
    );
  }
}
