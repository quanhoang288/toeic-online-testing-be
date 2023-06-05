import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RoleEntity } from '../../../database/entities/role.entity';
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
    console.log('running role seed service');
    await Promise.all(
      roleData.map(async (role) => {
        const existingRole = await this.getRepository().findOneBy({
          name: role.name,
        });
        if (!existingRole) {
          await this.getRepository().save(role);
        } else {
          await this.getRepository().update({ id: existingRole.id }, role);
        }
      }),
    );
    console.log('running role seed service done');
    console.log('==============================');
  }
}
