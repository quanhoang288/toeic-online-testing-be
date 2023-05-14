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

export class QuestionArchiveDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  sectionId!: number;

  @ApiProperty({ type: [QuestionDto], required: false })
  @IsArray()
  @IsOptional()
  questions?: QuestionDto[];

  @ApiProperty({ type: [QuestionSetDto], required: false })
  @IsArray()
  @IsOptional()
  questionSets?: QuestionSetDto[];
}
