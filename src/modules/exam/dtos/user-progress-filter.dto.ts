import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UserProgressFilterDto {
  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  from?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  to?: string;
}
