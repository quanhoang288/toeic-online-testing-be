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

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  orderInExam?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  numQuestions?: number;

  @ApiProperty({ nullable: true, required: false, type: [QuestionDto] })
  @IsOptional()
  @IsArray()
  questions?: QuestionDto[];

  @ApiProperty({ nullable: true, required: false, type: [QuestionSetDto] })
  @IsOptional()
  @IsArray()
  questionSets?: QuestionSetDto[];
}
