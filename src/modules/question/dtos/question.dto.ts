import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { AnswerDto } from './answer.dto';

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
  imageFileIndex?: number;

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
  answers: AnswerDto[];
}
