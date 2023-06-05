import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { JwtAuthStrategy } from './strategies/jwt-auth.strategy';
import { GoogleOAuthStrategy } from './strategies/google-oauth.strategy';
import { AuthController } from './auth.controller';
import { AppConfigService } from '../../shared/services/app-config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountProviderLinkingEntity } from '../../database/entities/account-provider-linking.entity';
import { OAuthProviderEntity } from '../../database/entities/oauth-provider.entity';
import { AccountEntity } from '../../database/entities/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountEntity,
      OAuthProviderEntity,
      AccountProviderLinkingEntity,
    ]),
    UserModule,
    PassportModule.register({
      defaultStrategy: 'google',
      session: false,
    }),
    JwtModule.registerAsync({
      useFactory: (configService: AppConfigService) => ({
        secret: configService.jwtConfig.secret,
      }),
      inject: [AppConfigService],
    }),
  ],
  providers: [AuthService, JwtAuthStrategy, GoogleOAuthStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
