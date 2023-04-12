import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamEntity } from '../../database/entities/exam.entity';
import { ExamDetailEntity } from '../../database/entities/exam-detail.entity';
import { SectionEntity } from '../../database/entities/section.entity';
import { ExamSectionEntity } from '../../database/entities/exam-section.entity';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExamEntity,
      ExamDetailEntity,
      SectionEntity,
      ExamSectionEntity,
    ]),
  ],
  providers: [ExamService],
  controllers: [ExamController],
})
export class ExamModule {}
