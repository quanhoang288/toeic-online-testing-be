import {
  Controller,
  Get,
  Post,
  Redirect,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OAuthProvider } from '../../common/constants/oauth-provider';
import { Request as ExpressRequest, Response } from 'express';
import { AccountEntity } from '../../database/entities/account.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req: ExpressRequest) {
    return this.authService.getAuthUser(
      req.user.id,
      req.user.authProvider as OAuthProvider,
    );
  }

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async loginWithGoogle(@Request() req) {}

  @Get('google/callback')
  @Redirect('http://localhost:3000', 302)
  @UseGuards(GoogleOAuthGuard)
  async handleGoogleOAuthCallback(
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.authenticate(
      req.user as AccountEntity,
      OAuthProvider.GOOGLE,
    );
    res.cookie('accessToken', tokens.accessToken, {
      expires: tokens.accessTokenExpiresAt,
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      expires: tokens.refreshTokenExpiresAt,
    });
    const redirectUrl = req.cookies?.redirectUrl || 'http://localhost:3000';
    return { url: redirectUrl };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return this.authService.logout(
      req.user.id,
      req.user.authProvider as OAuthProvider,
    );
  }
}
