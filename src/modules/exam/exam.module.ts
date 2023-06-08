import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamEntity } from '../../database/entities/exam.entity';
import { ExamDetailEntity } from '../../database/entities/exam-detail.entity';
import { SectionEntity } from '../../database/entities/section.entity';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { QuestionModule } from '../question/question.module';
import { ExamTypeEntity } from '../../database/entities/exam-type.entity';
import { ExamResultEntity } from '../../database/entities/exam-result.entity';
import { UserModule } from '../user/user.module';
import { ExamRegistrationEntity } from '../../database/entities/exam-registration.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExamEntity,
      ExamDetailEntity,
      SectionEntity,
      ExamTypeEntity,
      ExamRegistrationEntity,
      ExamResultEntity,
    ]),
    QuestionModule,
    UserModule,
  ],
  providers: [ExamService],
  controllers: [ExamController],
})
export class ExamModule {}
