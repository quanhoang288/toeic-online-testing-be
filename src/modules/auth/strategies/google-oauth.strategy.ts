import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { AccountEntity } from '../../../database/entities/account.entity';
import { AppConfigService } from '../../../shared/services/app-config.service';
import { OAuthProvider } from '../../../common/constants/oauth-provider';

@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    appConfigService: AppConfigService,
    private readonly userService: UserService,
  ) {
    super(appConfigService.googleOAuthConfig);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<AccountEntity> {
    return this.userService.findOrCreateFromOAuth(OAuthProvider.GOOGLE, {
      email: profile.emails?.[0].value,
      firstName: profile.name?.givenName,
      lastName: profile.name?.familyName,
      name: profile.displayName,
      profileUrl: profile.photos[0].value,
    });
  }
}
