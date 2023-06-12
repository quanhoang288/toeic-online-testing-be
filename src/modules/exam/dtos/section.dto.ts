import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { QuestionSetDto } from 'src/modules/question/dtos/question-set.dto';
import { QuestionDto } from 'src/modules/question/dtos/question.dto';
import { SectionType } from '../../../common/constants/section-type';
import { Type } from 'class-transformer';

export class ExamSectionDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  type: SectionType;

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
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions?: QuestionDto[];

  @ApiProperty({ nullable: true, required: false, type: [QuestionSetDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionSetDto)
  questionSets?: QuestionSetDto[];

  @ApiProperty({
    nullable: true,
    required: false,
    description:
      'Number of correct questions within exam section. Used for exam result API',
  })
  @IsOptional()
  numCorrects?: number;
}
