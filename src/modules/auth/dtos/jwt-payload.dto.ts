import { IsNotEmpty, IsString } from 'class-validator';

export class JwtPayload {
  @IsNotEmpty()
  @IsString()
  sub: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  email: string;
}
