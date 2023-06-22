import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { AccountEntity } from '../../database/entities/account.entity';
import { RoleEntity } from '../../database/entities/role.entity';
import { OAuthProvider } from '../../common/constants/oauth-provider';
import { OAuthUserProfileDto } from '../auth/dtos/oauth-user-profile.dto';
import { OAuthProviderEntity } from '../../database/entities/oauth-provider.entity';
import { AccountProviderLinkingEntity } from '../../database/entities/account-provider-linking.entity';
import { TransactionService } from '../../shared/services/transaction.service';
import { AccountHasRoleEntity } from '../../database/entities/account-has-role.entity';
import { UserDto } from './dtos/user.dto';
import { extractUserIdFromOrderInfo } from '../../common/utils/vnpay-util';
import { VnPayPaymentResultDto } from '../payment/vnpay/dtos/vnpay-payment-result.dto';
import moment from 'moment-timezone';
import { Role } from '../../common/constants/role';

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
    private readonly transactionService: TransactionService,
  ) {}

  async findOneById(
    userId: number,
    withRoles?: boolean,
  ): Promise<AccountEntity | null> {
    return this.accountRepository.findOne({
      where: { id: userId },
      relations: {
        roles: withRoles || false,
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
        });
        user = await queryRunner.manager
          .getRepository(AccountEntity)
          .save(newUser);

        await queryRunner.manager.getRepository(AccountHasRoleEntity).save({
          accountId: user.id,
          roleId: userRole.id,
        });
        user.roles = [userRole];
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

    await queryRunner.manager.getRepository(AccountHasRoleEntity).save({
      accountId: user.id,
      roleId: vipRole.id,
      expiresAt: moment(new Date()).add(43200, 'minutes').toDate(),
    });
    await queryRunner.manager.getRepository(AccountEntity).save(user);
  }
}
