import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradingController } from './grading.controller';
import { GradingService } from './grading.service';
import { ExamDetailEntity } from '../../database/entities/exam-detail.entity';
import { QuestionArchiveDetailEntity } from '../../database/entities/question-archive-detail.entity';
import { ExamResultEntity } from '../../database/entities/exam-result.entity';
import { ExamResultDetailEntity } from '../../database/entities/exam-result-detail.entity';
import { QuestionArchiveResultEntity } from '../../database/entities/question-archive-result.entity';
import { QuestionArchiveResultDetailEntity } from '../../database/entities/question-archive-result-detail.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExamDetailEntity,
      QuestionArchiveDetailEntity,
      ExamResultEntity,
      ExamResultDetailEntity,
      QuestionArchiveResultEntity,
      QuestionArchiveResultDetailEntity,
    ]),
  ],
  providers: [GradingService],
  controllers: [GradingController],
})
export class GradingModule {}
