import { Module } from '@nestjs/common';
import { QuestionService } from './services/question.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionEntity } from '../../database/entities/question.entity';
import { AnswerEntity } from '../../database/entities/answer.entity';
import { QuestionSetService } from './services/question-set.service';
import { QuestionSetImageEntity } from '../../database/entities/question-set-image.entity';
import { QuestionSetEntity } from '../../database/entities/question-set.entity';

const providers = [QuestionService, QuestionSetService];

@Module({
  providers,
  imports: [
    TypeOrmModule.forFeature([
      QuestionEntity,
      QuestionSetEntity,
      QuestionSetImageEntity,
      AnswerEntity,
    ]),
  ],
  exports: providers,
})
export class QuestionModule {}
