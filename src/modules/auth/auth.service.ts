import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import _ from 'lodash';
import moment from 'moment-timezone';
import bcrypt from 'bcrypt';
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

import { UserDto } from '../user/dtos/user.dto';
import { JwtPayload } from './dtos/jwt-payload.dto';
import { AuthCredentialDto } from './dtos/auth-credential.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(OAuthProviderEntity)
    private readonly oauthProviderRepository: Repository<OAuthProviderEntity>,
    @InjectRepository(AccountProviderLinkingEntity)
    private readonly accountProviderRepository: Repository<AccountProviderLinkingEntity>,
  ) {}

  async getAuthUser(
    userId: number,
    providerName?: OAuthProvider,
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

    let username = user.username;
    let profileUrl = user.avatar;

    if (providerName) {
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
      username = userOAuth.name;
      profileUrl = userOAuth.profileUrl;
    }

    return {
      id: user.id,
      email: user.email,
      username,
      profileUrl,
      roles: (user.roles || []).map((role) => _.pick(role, ['id', 'name'])),
      isAdmin: (user.roles || []).some((role) => role.isAdmin),
    };
  }

  async register(userDto: UserDto): Promise<AuthTokenDto> {
    const user = await this.userService.create(userDto);
    return this.authenticate(user);
  }

  async login(credentials: AuthCredentialDto): Promise<AuthTokenDto> {
    const user = await this.userService.findOneByEmail(credentials.email);
    if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
      throw new BadRequestException('Email or password incorrect');
    }

    return this.authenticate(user);
  }

  async authenticate(
    user: AccountEntity,
    providerName?: OAuthProvider,
  ): Promise<AuthTokenDto> {
    const provider = await this.oauthProviderRepository.findOneBy({
      name: providerName,
    });
    if (!provider) {
      throw new InternalServerErrorException('OAuth provider not found');
    }
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      roles: (user.roles || []).map((role) => role.name),
    };
    if (providerName) {
      payload.provider = providerName;
    }

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

    if (providerName) {
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
    } else {
      await this.accountRepository.save({
        id: user.id,
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
    accessToken: string,
    provider?: OAuthProvider,
  ): Promise<AccountEntity> {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const now = moment(new Date());

    if (provider) {
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

      if (
        accessToken !== accountProvider.accessToken ||
        now.isSameOrAfter(moment(accountProvider.accessTokenExpiresAt))
      ) {
        throw new UnauthorizedException();
      }
      user.authProvider = provider;
    } else if (
      !user.accessToken ||
      accessToken !== user.accessToken ||
      now.isSameOrAfter(moment(user.accessTokenExpiresAt))
    ) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async logout(userId: number, providerName?: OAuthProvider): Promise<void> {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (providerName) {
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
    } else {
      await this.accountRepository.update(
        { id: userId },
        {
          accessToken: null,
          accessTokenExpiresAt: null,
        },
      );
    }
  }
}
