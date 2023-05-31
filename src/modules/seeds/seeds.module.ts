import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleSeedService } from './services/role-seed.service';
import { ExamTypeSeedService } from './services/exam-type-seed.service';
import { RoleEntity } from 'src/database/entities/role.entity';
import { ExamTypeEntity } from 'src/database/entities/exam-type.entity';
import { SeedsService } from './seeds.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity, ExamTypeEntity])],
  providers: [RoleSeedService, ExamTypeSeedService, SeedsService],
  exports: [SeedsService],
})
export class SeedsModule {}
