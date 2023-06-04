import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from '../../database/entities/account.entity';
import { RoleEntity } from '../../database/entities/role.entity';
import { OAuthProviderEntity } from '../../database/entities/oauth-provider.entity';
import { AccountProviderLinkingEntity } from '../../database/entities/account-provider-linking.entity';
import { AccountHasRoleEntity } from '../../database/entities/account-has-role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountEntity,
      RoleEntity,
      AccountHasRoleEntity,
      OAuthProviderEntity,
      AccountProviderLinkingEntity,
    ]),
  ],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}