import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from '../../database/entities/account.entity';
import { RoleEntity } from '../../database/entities/role.entity';
import { AccountHasRoleEntity } from '../../database/entities/account-has-role.entity';
import { PaymentModule } from '../payment/payment.module';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { ExamResultEntity } from '../../database/entities/exam-result.entity';
import { QuestionArchiveResultEntity } from '../../database/entities/question-archive-result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountEntity,
      RoleEntity,
      AccountHasRoleEntity,
      ExamResultEntity,
      QuestionArchiveResultEntity,
    ]),
    PaymentModule,
  ],
  providers: [StatsService],
  controllers: [StatsController],
})
export class StatsModule {}
