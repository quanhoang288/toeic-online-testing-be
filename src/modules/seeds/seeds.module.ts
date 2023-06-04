import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleSeedService } from './services/role-seed.service';
import { ExamTypeSeedService } from './services/exam-type-seed.service';
import { RoleEntity } from 'src/database/entities/role.entity';
import { ExamTypeEntity } from 'src/database/entities/exam-type.entity';
import { SeedsService } from './seeds.service';
import { OAuthProviderEntity } from '../../database/entities/oauth-provider.entity';
import { OAuthProviderSeedService } from './services/oauth-provider-seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity, ExamTypeEntity, OAuthProviderEntity]),
  ],
  providers: [
    RoleSeedService,
    ExamTypeSeedService,
    OAuthProviderSeedService,
    SeedsService,
  ],
  exports: [SeedsService],
})
export class SeedsModule {}
