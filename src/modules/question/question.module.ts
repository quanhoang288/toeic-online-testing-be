import { Module } from '@nestjs/common';
import { QuestionService } from './services/question.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionEntity } from '../../database/entities/question.entity';
import { AnswerEntity } from '../../database/entities/answer.entity';
import { QuestionSetService } from './services/question-set.service';
import { QuestionSetImageEntity } from '../../database/entities/question-set-image.entity';
import { QuestionSetEntity } from '../../database/entities/question-set.entity';
import { ExamDetailEntity } from '../../database/entities/exam-detail.entity';
import { QuestionArchiveDetailEntity } from '../../database/entities/question-archive-detail.entity';

const providers = [QuestionService, QuestionSetService];

@Module({
  providers,
  imports: [
    TypeOrmModule.forFeature([
      QuestionEntity,
      QuestionSetEntity,
      QuestionSetImageEntity,
      AnswerEntity,
      ExamDetailEntity,
      QuestionArchiveDetailEntity,
    ]),
  ],
  exports: providers,
})
export class QuestionModule {}
