import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class AnswerDto {
  @ApiProperty()
  @IsOptional()
  id?: number;

  @ApiProperty()
  @IsNotEmpty()
  content: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isCorrect: boolean;
}
