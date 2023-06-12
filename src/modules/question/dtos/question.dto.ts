import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AnswerDto } from './answer.dto';
import { Type } from 'class-transformer';

export class QuestionDto {
  sectionId?: number;

  questionSetId?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty()
  type: string;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ nullable: true })
  audioFileIndex?: number;

  @ApiProperty({ nullable: true })
  imageFileIndex?: number;

  @ApiProperty({ nullable: true })
  audioKey?: string;

  @ApiProperty({ nullable: true })
  imageKey?: string;

  @ApiProperty({ nullable: true })
  explanation?: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  orderInQuestionSet?: number;

  @ApiProperty({ type: [AnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];

  @ApiProperty({ description: 'Selected answer. Used for exam result APIs' })
  @IsOptional()
  selectedAnswerId?: number;

  @ApiProperty({
    description:
      'Flag indicating whether selected answer is correct or not. Used for exam result APIs',
  })
  @IsOptional()
  isCorrect?: boolean;
}
