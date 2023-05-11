import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class AnswerDto {
  @ApiProperty()
  id?: number;

  @ApiProperty()
  @IsNotEmpty()
  content: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isCorrect: boolean;
}
