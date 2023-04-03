import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly userName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
