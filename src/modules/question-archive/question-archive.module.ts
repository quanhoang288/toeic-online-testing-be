import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionArchiveEntity } from '../../database/entities/question-archive.entity';
import { QuestionArchiveDetailEntity } from '../../database/entities/question-archive-detail.entity';
import { QuestionArchiveService } from './question-archive.service';
import { QuestionArchiveController } from './question-archive.controller';
import { QuestionModule } from '../question/question.module';
import { QuestionArchiveResultEntity } from '../../database/entities/question-archive-result.entity';
import { UserModule } from '../user/user.module';

@Module({
  providers: [QuestionArchiveService],
  imports: [
    TypeOrmModule.forFeature([
      QuestionArchiveEntity,
      QuestionArchiveDetailEntity,
      QuestionArchiveResultEntity,
    ]),
    QuestionModule,
    UserModule,
  ],
  controllers: [QuestionArchiveController],
})
export class QuestionArchiveModule {}
