import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { QuestionSetDto } from 'src/modules/question/dtos/question-set.dto';
import { QuestionDto } from 'src/modules/question/dtos/question.dto';

export class QuestionArchiveDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsString()
  type!: string;

  @ApiProperty()
  @IsArray()
  questions: QuestionDto[];

  @ApiProperty()
  @IsArray()
  questionSets: QuestionSetDto[];
}
