import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionArchiveEntity } from '../../database/entities/question-archive.entity';
import { QuestionArchiveDetailEntity } from '../../database/entities/question-archive-detail.entity';
import { QuestionService } from '../question/services/question.service';
import { QuestionSetService } from '../question/services/question-set.service';
import { QuestionArchiveService } from './question-archive.service';
import { QuestionArchiveController } from './question-archive.controller';
import { QuestionModule } from '../question/question.module';

@Module({
  providers: [QuestionArchiveService],
  imports: [
    TypeOrmModule.forFeature([
      QuestionArchiveEntity,
      QuestionArchiveDetailEntity,
    ]),
    QuestionModule,
  ],
  controllers: [QuestionArchiveController],
})
export class QuestionArchiveModule {}
