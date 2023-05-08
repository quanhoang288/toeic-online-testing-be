import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamSetEntity } from '../../database/entities/exam-set.entity';
import { ExamSetService } from './exam-set.service';
import { ExamSetController } from './exam-set.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ExamSetEntity])],
  providers: [ExamSetService],
  controllers: [ExamSetController],
})
export class ExamSetModule {}
