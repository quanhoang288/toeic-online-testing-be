import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class JwtPayload {
  @IsNotEmpty()
  @IsNumber()
  sub: number;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsNotEmpty()
  @IsArray()
  roles: string[];
}
