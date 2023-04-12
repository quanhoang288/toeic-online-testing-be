import { Module } from '@nestjs/common';
import { QuestionService } from './services/question.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionEntity } from '../../database/entities/question.entity';
import { AnswerEntity } from '../../database/entities/answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionEntity, AnswerEntity])],
  providers: [QuestionService],
  exports: [QuestionService],
})
export class QuestionModule {}
