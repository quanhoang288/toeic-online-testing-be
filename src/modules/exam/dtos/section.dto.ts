import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { QuestionSetDto } from 'src/modules/question/dtos/question-set.dto';
import { QuestionDto } from 'src/modules/question/dtos/question.dto';

export class ExamSectionDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  orderInExam?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  numQuestions?: number;

  @ApiProperty({ nullable: true, type: [QuestionDto] })
  @IsOptional()
  @IsArray()
  questions?: QuestionDto[];

  @ApiProperty({ nullable: true, type: [QuestionSetDto] })
  @IsOptional()
  @IsArray()
  questionSets?: QuestionSetDto[];
}
