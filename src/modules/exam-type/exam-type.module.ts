import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExamTypeEntity } from '../../database/entities/exam-type.entity';
import { ExamTypeService } from './exam-type.service';
import { ExamTypeController } from './exam-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ExamTypeEntity])],

  providers: [ExamTypeService],
  controllers: [ExamTypeController],
})
export class ExamTypeModule {}
