import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ExamSetDto {
  @ApiProperty({ nullable: true })
  id?: number;

  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ nullable: true })
  description?: string;
}
