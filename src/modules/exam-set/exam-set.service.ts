import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { ExamSetDto } from './dtos/exam-set.dto';
import { ExamSetEntity } from '../../database/entities/exam-set.entity';

@Injectable()
export class ExamSetService {
  constructor(
    @InjectRepository(ExamSetEntity)
    private readonly examSetRepository: Repository<ExamSetEntity>,
  ) {}

  async create(examSetDto: ExamSetDto): Promise<ExamSetDto> {
    const existingExamSet = await this.examSetRepository.findOneBy({
      title: examSetDto.title,
    });
    if (existingExamSet) {
      throw new BadRequestException('Exam set title must be unique');
    }

    const createdExamSet = await this.examSetRepository.save({
      title: examSetDto.title,
      description: examSetDto.description,
    });

    return {
      ...examSetDto,
      id: createdExamSet.id,
    };
  }

  async list(title?: string): Promise<ExamSetDto[]> {
    const where: FindOptionsWhere<ExamSetEntity> = {};
    if (title) {
      where.title = Like(title);
    }

    return this.examSetRepository.find({ where });
  }
}
