import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradingController } from './grading.controller';
import { GradingService } from './services/grading.service';
import { ExamDetailEntity } from '../../database/entities/exam-detail.entity';
import { QuestionArchiveDetailEntity } from '../../database/entities/question-archive-detail.entity';
import { ExamResultEntity } from '../../database/entities/exam-result.entity';
import { ExamResultDetailEntity } from '../../database/entities/exam-result-detail.entity';
import { QuestionArchiveResultEntity } from '../../database/entities/question-archive-result.entity';
import { QuestionArchiveResultDetailEntity } from '../../database/entities/question-archive-result-detail.entity';
import { ExamEntity } from '../../database/entities/exam.entity';
import { UserModule } from '../user/user.module';
import { PointConversionService } from './services/point-conversion.service';
import { SectionEntity } from '../../database/entities/section.entity';
import { QuestionArchiveEntity } from '../../database/entities/question-archive.entity';
@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([
      ExamEntity,
      ExamDetailEntity,
      QuestionArchiveDetailEntity,
      ExamResultEntity,
      ExamResultDetailEntity,
      QuestionArchiveEntity,
      QuestionArchiveResultEntity,
      QuestionArchiveResultDetailEntity,
      SectionEntity,
    ]),
  ],
  providers: [PointConversionService, GradingService],
  controllers: [GradingController],
})
export class GradingModule {}
