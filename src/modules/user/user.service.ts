import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { In, QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import moment from 'moment-timezone';

import { AccountEntity } from '../../database/entities/account.entity';
import { RoleEntity } from '../../database/entities/role.entity';
import { OAuthProvider } from '../../common/constants/oauth-provider';
import { OAuthUserProfileDto } from '../auth/dtos/oauth-user-profile.dto';
import { OAuthProviderEntity } from '../../database/entities/oauth-provider.entity';
import { AccountProviderLinkingEntity } from '../../database/entities/account-provider-linking.entity';
import { TransactionService } from '../../shared/services/transaction.service';
import { AccountHasRoleEntity } from '../../database/entities/account-has-role.entity';
import { UserDetailDto, UserDto } from './dtos/user.dto';
import { extractUserIdFromOrderInfo } from '../../common/utils/vnpay-util';
import { VnPayPaymentResultDto } from '../payment/vnpay/dtos/vnpay-payment-result.dto';
import { Role } from '../../common/constants/role';
import { UserFilterDto } from './dtos/user-filter.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { GroupRequestToJoinStatus } from '../group/enums/group-request-to-join-status';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(OAuthProviderEntity)
    private readonly oauthProviderRepository: Repository<OAuthProviderEntity>,
    @InjectRepository(AccountProviderLinkingEntity)
    private readonly accountProviderRepository: Repository<AccountProviderLinkingEntity>,
    @InjectRepository(AccountHasRoleEntity)
    private readonly accountHasRoleRepository: Repository<AccountHasRoleEntity>,
    private readonly transactionService: TransactionService,
  ) {}

  async list(
    searchParams: UserFilterDto,
  ): Promise<PaginationDto<UserDetailDto>> {
    const qb = this.accountRepository.createQueryBuilder('a').where('1 = 1');

    if (searchParams.username) {
      qb.andWhere('a.username LIKE :username', {
        username: `%${searchParams.username}%`,
      });
    }
    if (searchParams.email) {
      qb.andWhere('a.email LIKE :email', { email: `%${searchParams.email}%` });
    }
    if (searchParams.groupId) {
      qb.innerJoin(
        'a.accountGroups',
        'ac',
        'ac.groupId = :groupId AND ac.requestToJoinStatus = :status',
        {
          groupId: searchParams.groupId,
          status: GroupRequestToJoinStatus.ACCEPTED,
        },
      );
    }
    if (searchParams.role) {
      qb.innerJoin('a.roles', 'r', 'r.name = :roleName', {
        roleName: searchParams.role,
      });
    }

    const numRecords = await qb.getCount();
    const users = await qb
      .skip(searchParams.skip)
      .take(searchParams.perPage)
      .getMany();

    const userRoles = await this.accountHasRoleRepository.find({
      where: {
        accountId: In(users.map((user) => user.id)),
        expiresAt: null,
      },
      relations: ['role'],
    });

    return {
      page: searchParams.page,
      pageCount: searchParams.perPage,
      totalCount: numRecords,
      data: users.map((user) => ({
        ..._.pick(user, ['id', 'username', 'email', 'avatar']),
        roles: userRoles
          .filter((ur) => ur.accountId === user.id)
          .map((ur) => _.pick(ur.role, ['id', 'name', 'isAdmin'])),
      })),
    };
  }

  async createAdmin(adminDto: UserDto): Promise<void> {
    const existingAdmin = await this.accountRepository.findOneBy({
      email: adminDto.email,
    });
    if (existingAdmin) {
      throw new BadRequestException('Admin with given email already existed');
    }

    const createdAcc = await this.accountRepository.save({
      ...adminDto,
      password: await bcrypt.hash(adminDto.password, 10),
    });

    const adminRole = await this.roleRepository.findOneBy({ name: Role.ADMIN });
    if (!adminRole) {
      throw new InternalServerErrorException('Admin role not found in DB');
    }
    await this.accountHasRoleRepository.save({
      accountId: createdAcc.id,
      roleId: adminRole.id,
    });
  }

  async findOneById(
    userId: number,
    withRoles?: boolean,
  ): Promise<AccountEntity | null> {
    return this.accountRepository.findOne({
      where: { id: userId },
      relations: {
        roles: withRoles || false,
        accountGroups: true,
      },
    });
  }

  async findOneByEmail(email: string): Promise<AccountEntity | null> {
    return this.accountRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
  }

  async create(userDto: UserDto): Promise<AccountEntity> {
    const existingAccount = await this.accountRepository.findOneBy({
      email: userDto.email,
    });
    if (existingAccount) {
      throw new BadRequestException('User with given email already exists');
    }

    const userRole = await this.roleRepository.findOneBy({ name: 'user' });
    if (!userRole) {
      throw new InternalServerErrorException('Role not found');
    }

    let createdAccount: AccountEntity;

    await this.transactionService.runInTransaction(async (queryRunner) => {
      createdAccount = await queryRunner.manager
        .getRepository(AccountEntity)
        .save({
          ...userDto,
          password: await bcrypt.hash(userDto.password, 10),
        });

      await queryRunner.manager.getRepository(AccountHasRoleEntity).save({
        accountId: createdAccount.id,
        roleId: userRole.id,
      });
      createdAccount.roles = [userRole];
    });

    if (!createdAccount) {
      throw new InternalServerErrorException('Error creating new user');
    }

    return createdAccount;
  }

  async findOrCreateFromOAuth(
    oauthProvider: OAuthProvider,
    profileDto: OAuthUserProfileDto,
  ): Promise<AccountEntity> {
    let user: AccountEntity;

    await this.transactionService.runInTransaction(async (queryRunner) => {
      const provider = await this.oauthProviderRepository.findOneBy({
        name: oauthProvider,
      });
      if (!provider) {
        throw new InternalServerErrorException('OAuth provider not found');
      }

      user = await this.accountRepository.findOne({
        where: { email: profileDto.email },
        relations: ['roles'],
      });
      if (!user) {
        const userRole = await this.roleRepository.findOneBy({ name: 'user' });
        if (!userRole) {
          throw new InternalServerErrorException('Role not found');
        }
        const newUser = this.accountRepository.create({
          email: profileDto.email,
          username: profileDto.name,
          avatar: profileDto.profileUrl,
        });
        user = await queryRunner.manager
          .getRepository(AccountEntity)
          .save(newUser);

        await queryRunner.manager.getRepository(AccountHasRoleEntity).save({
          accountId: user.id,
          roleId: userRole.id,
        });
        user.roles = [userRole];
      } else {
        user.username = profileDto.name;
        user.avatar = profileDto.profileUrl;
        await queryRunner.manager.getRepository(AccountEntity).save(user);
      }

      const existingLink = await this.accountProviderRepository.findOne({
        where: {
          accountId: user.id,
          providerId: provider.id,
        },
      });
      if (!existingLink) {
        await queryRunner.manager
          .getRepository(AccountProviderLinkingEntity)
          .save({
            accountId: user.id,
            providerId: provider.id,
            firstName: profileDto.firstName,
            lastName: profileDto.lastName,
            name: profileDto.name,
            profileUrl: profileDto.profileUrl,
          });
      }
    });

    if (!user) {
      throw new InternalServerErrorException(
        'Error creating user from OAuth provider',
      );
    }

    return user;
  }

  async upgradeUserAfterVnpayPaymentSuccess(
    txRes: VnPayPaymentResultDto,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const userId = extractUserIdFromOrderInfo(txRes.vnp_OrderInfo);
    const user = await queryRunner.manager
      .getRepository(AccountEntity)
      .findOneBy({ id: parseInt(userId) });
    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    const vipRole = await queryRunner.manager
      .getRepository(RoleEntity)
      .findOne({
        where: { name: Role.VIP_USER },
      });
    if (!vipRole) {
      throw new InternalServerErrorException('VIP role not found');
    }

    const existingAccHasVipRole = await queryRunner.manager
      .getRepository(AccountHasRoleEntity)
      .findOne({
        where: {
          accountId: user.id,
          roleId: vipRole.id,
        },
      });

    await queryRunner.manager.getRepository(AccountHasRoleEntity).save({
      id: existingAccHasVipRole?.id,
      accountId: user.id,
      roleId: vipRole.id,
      expiresAt: moment(new Date()).add(43200, 'minutes').toDate(),
    });
    await queryRunner.manager.getRepository(AccountEntity).save(user);
  }

  async delete(userId: number, authUserId: number): Promise<void> {
    const user = await this.accountRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['roles'],
    });

    const admin = await this.accountRepository.findOne({
      where: {
        id: authUserId,
      },
      relations: ['roles'],
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (
      user.roles.map((o) => o.name).includes(Role.ADMIN) &&
      !admin.roles.map((o) => o.name).includes(Role.SUPER_ADMIN)
    ) {
      throw new BadRequestException('Only Super Admin can delete Admin');
    }

    await this.accountRepository.delete(userId);
  }
}
