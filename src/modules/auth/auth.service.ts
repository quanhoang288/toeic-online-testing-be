import bcrypt from 'bcrypt';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { TokenPayloadDto } from './dto/token-payload.dto';
import { authConfig } from 'src/config/auth.config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}
  async login(credentials: LoginDto): Promise<LoginResponseDto> {
    const { userName, password } = credentials;
    const user = await this.userRepository.findByUserName(userName);
    if (!user) {
      throw new NotFoundException();
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new BadRequestException();
    }

    const tokenPayload = new TokenPayloadDto({
      expiresIn: authConfig.jwt.accessTokenExpiresInSec,
      accessToken: this.jwtService.sign({
        username: user.userName,
        sub: user.id,
      }),
    });

    return new LoginResponseDto({ token: tokenPayload });
  }
}
