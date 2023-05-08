import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ApiResponseDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  code?: string;
}
