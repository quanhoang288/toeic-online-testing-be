import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { default as config } from '../../config';
import { RoleSeedService } from './services/role-seed.service';
import { ExamTypeSeedService } from './services/exam-type-seed.service';
import { RoleEntity } from '../../database/entities/role.entity';
import { ExamTypeEntity } from '../../database/entities/exam-type.entity';
import { SeedsService } from './seeds.service';
import { OAuthProviderEntity } from '../../database/entities/oauth-provider.entity';
import { OAuthProviderSeedService } from './services/oauth-provider-seed.service';
import { AdminSeedService } from './services/admin-seed.service';
import { AccountEntity } from '../../database/entities/account.entity';
import { SharedModule } from '../../shared/shared.module';
import { ExamEntity } from '../../database/entities/exam.entity';
import { QuestionModule } from '../question/question.module';
import { ExamSeedService } from './services/exam-seed.service';

@Module({
  imports: [
    SharedModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      load: Object.values(config),
    }),
    TypeOrmModule.forFeature([
      AccountEntity,
      RoleEntity,
      ExamTypeEntity,
      OAuthProviderEntity,
      ExamEntity,
      ExamTypeEntity,
    ]),
    QuestionModule,
  ],
  providers: [
    AdminSeedService,
    RoleSeedService,
    ExamTypeSeedService,
    OAuthProviderSeedService,
    SeedsService,
    ExamSeedService,
  ],
  exports: [SeedsService],
})
export class SeedsModule {}
