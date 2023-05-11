import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import _ from 'lodash';
import { ExamTypeEntity } from '../../database/entities/exam-type.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ExamTypeDto } from './dtos/exam-type.dto';

@Injectable()
export class ExamTypeService {
  constructor(
    @InjectRepository(ExamTypeEntity)
    private readonly examTypeRepository: Repository<ExamTypeEntity>,
  ) {}

  public async getExamTypes(): Promise<ExamTypeDto[]> {
    return (
      await this.examTypeRepository.find({ relations: ['sections'] })
    ).map((examType) =>
      _.pick(examType, [
        'id',
        'name',
        'readingPoints',
        'listeningPoints',
        'totalPoints',
        'sections',
      ]),
    );
  }
}
