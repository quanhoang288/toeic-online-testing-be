import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ExamSetDto {
  @ApiProperty()
  id?: number;

  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  description?: string;
}
