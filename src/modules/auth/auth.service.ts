import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import moment from 'moment-timezone';
import { AccountEntity } from '../../database/entities/account.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthTokenDto } from './dtos/auth-token.dto';
import { AppConfigService } from '../../shared/services/app-config.service';
import { UserService } from '../user/user.service';
import { AuthUserDto } from './dtos/auth-user.dto';
import { OAuthProvider } from '../../common/constants/oauth-provider';
import { InjectRepository } from '@nestjs/typeorm';
import { OAuthProviderEntity } from '../../database/entities/oauth-provider.entity';
import { AccountProviderLinkingEntity } from '../../database/entities/account-provider-linking.entity';
import { Repository } from 'typeorm';
import _ from 'lodash';

@Injectable()
export class AuthService {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @InjectRepository(OAuthProviderEntity)
    private readonly oauthProviderRepository: Repository<OAuthProviderEntity>,
    @InjectRepository(AccountProviderLinkingEntity)
    private readonly accountProviderRepository: Repository<AccountProviderLinkingEntity>,
  ) {}

  async getAuthUser(
    userId: number,
    providerName: OAuthProvider,
  ): Promise<AuthUserDto> {
    const provider = await this.oauthProviderRepository.findOneBy({
      name: providerName,
    });
    if (!provider) {
      throw new BadRequestException('OAuth provider not found');
    }
    const user = await this.userService.findOneById(userId, true);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userOAuth = await this.accountProviderRepository.findOne({
      where: {
        accountId: user.id,
        providerId: provider.id,
      },
    });
    if (!userOAuth) {
      throw new BadRequestException(
        'User not logged in with this provider yet',
      );
    }

    return {
      id: user.id,
      email: user.email,
      username: userOAuth.name,
      profileUrl: userOAuth.profileUrl,
      roles: (user.roles || []).map((role) => _.pick(role, ['id', 'name'])),
      isAdmin: (user.roles || []).some((role) => role.isAdmin),
    };
  }

  async authenticate(
    user: AccountEntity,
    providerName: OAuthProvider,
  ): Promise<AuthTokenDto> {
    const provider = await this.oauthProviderRepository.findOneBy({
      name: providerName,
    });
    if (!provider) {
      throw new InternalServerErrorException('OAuth provider not found');
    }
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      provider: providerName,
      roles: (user.roles || []).map((role) => role.name),
    };

    const jwtConfig = this.appConfigService.jwtConfig;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: jwtConfig.accessTokenExpiresIn,
      }),
      this.jwtService.signAsync(
        { userId: user.id },
        { expiresIn: jwtConfig.refreshTokenExpiresIn },
      ),
    ]);

    const accessTokenExpiresAt = moment(new Date())
      .add(jwtConfig.accessTokenExpiresIn, 'seconds')
      .toDate();
    const refreshTokenExpiresAt = moment(new Date())
      .add(jwtConfig.refreshTokenExpiresIn, 'seconds')
      .toDate();

    const existingLink = await this.accountProviderRepository.findOne({
      where: {
        accountId: user.id,
        providerId: provider.id,
      },
    });
    if (existingLink) {
      await this.accountProviderRepository.update(
        { id: existingLink.id },
        {
          accessToken,
          refreshToken,
          accessTokenExpiresAt,
          refreshTokenExpiresAt,
        },
      );
    } else {
      await this.accountProviderRepository.save({
        accountId: user.id,
        providerId: provider.id,
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
      });
    }

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
    };
  }

  async validateUser(
    userId: number,
    provider: OAuthProvider,
    accessToken: string,
  ): Promise<AccountEntity> {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const oauthProvider = await this.oauthProviderRepository.findOneBy({
      name: provider,
    });
    if (!oauthProvider) {
      throw new BadRequestException('OAuth provider not found');
    }

    const accountProvider = await this.accountProviderRepository.findOne({
      where: {
        accountId: user.id,
        providerId: oauthProvider.id,
      },
    });
    if (!accountProvider) {
      throw new BadRequestException(
        'User not logged in with given provider yet',
      );
    }

    const now = moment(new Date());

    if (
      accessToken !== accountProvider.accessToken ||
      now.isSameOrAfter(moment(accountProvider.accessTokenExpiresAt))
    ) {
      throw new UnauthorizedException();
    }

    user.authProvider = provider;
    return user;
  }

  async logout(userId: number, providerName: OAuthProvider): Promise<void> {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const provider = await this.oauthProviderRepository.findOneBy({
      name: providerName,
    });
    if (!provider) {
      throw new InternalServerErrorException('OAuth provider not found');
    }

    await this.accountProviderRepository.update(
      {
        accountId: userId,
        providerId: provider.id,
      },
      {
        accessToken: null,
        accessTokenExpiresAt: null,
      },
    );
  }
}
