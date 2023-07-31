import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import _ from 'lodash';

import { RoleEntity } from '../../../database/entities/role.entity';
import { SeedBaseService } from './seed-base.service';

import adminData from '../data/admin.json';
import { AccountEntity } from '../../../database/entities/account.entity';
import { AppConfigService } from '../../../shared/services/app-config.service';
import { Role } from '../../../common/constants/role';
import { AccountHasRoleEntity } from '../../../database/entities/account-has-role.entity';

@Injectable()
export class AdminSeedService extends SeedBaseService<AccountEntity> {
  constructor(
    @InjectRepository(AccountEntity)
    accountRepository: Repository<AccountEntity>,
    private readonly appConfigService: AppConfigService,
  ) {
    super(accountRepository);
  }

  public async run(): Promise<void> {
    console.log('running admin seed service');
    await Promise.all(
      adminData.map(async (admin) => {
        const existingAdmin = await this.getRepository().findOneBy({
          email: admin.email,
        });
        if (!existingAdmin) {
          const adminRole = await this.getRepository()
            .manager.getRepository(RoleEntity)
            .findOneBy({ name: Role.ADMIN });
          if (!adminRole) {
            throw new Error('Admin role not seeded');
          }
          const superAdminRole = await this.getRepository()
            .manager.getRepository(RoleEntity)
            .findOneBy({ name: Role.SUPER_ADMIN });
          if (!superAdminRole) {
            throw new Error('Super admin role not seeded');
          }
          const hashedPassword = await bcrypt.hash(
            this.appConfigService.defaultAdminPassword,
            10,
          );
          const createdAdmin = await this.getRepository().save({
            ..._.pick(admin, ['email', 'username']),
            password: hashedPassword,
          });
          await this.getRepository()
            .manager.getRepository(AccountHasRoleEntity)
            .save({
              accountId: createdAdmin.id,
              roleId: admin.isSuperAdmin ? superAdminRole.id : adminRole.id,
            });
        }
      }),
    );
    console.log('running admin seed service done');
    console.log('==============================');
  }
}
