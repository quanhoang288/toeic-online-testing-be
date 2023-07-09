import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class StatsFilterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  from: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  to: string;
}
