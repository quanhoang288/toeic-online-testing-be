import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { QuestionAttemptDto } from './question-attempt.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ExamSectionAttempt {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  sectionId: number;

  @ApiProperty({ type: [QuestionAttemptDto] })
  @IsArray()
  @IsOptional()
  questions?: QuestionAttemptDto[];
}

export class ExamAttemptDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  examId: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isPartial?: boolean;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  timeTakenInSecs: number;

  @ApiProperty({ required: false, type: [ExamSectionAttempt] })
  @IsArray()
  @IsOptional()
  sections?: ExamSectionAttempt[];
}
