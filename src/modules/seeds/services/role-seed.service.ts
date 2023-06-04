import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RoleEntity } from 'src/database/entities/role.entity';
import { SeedBaseService } from './seed-base.service';

import roleData from '../data/role.json';

@Injectable()
export class RoleSeedService extends SeedBaseService<RoleEntity> {
  constructor(
    @InjectRepository(RoleEntity)
    roleRepository: Repository<RoleEntity>,
  ) {
    super(roleRepository);
  }

  public async run(): Promise<void> {
    await this.getRepository().upsert(
      (roleData || []).map((role) => this.getRepository().create(role)),
      {
        conflictPaths: ['name'],
      },
    );
  }
}
