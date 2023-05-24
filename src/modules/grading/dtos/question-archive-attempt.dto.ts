import { IsArray, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { QuestionAttemptDto } from './question-attempt.dto';
import { ApiProperty } from '@nestjs/swagger';

export class QuestionArchiveAttemptDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  questionArchiveId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  accountId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  timeTakenInSecs: number;

  @ApiProperty({ required: false, type: [QuestionAttemptDto] })
  @IsArray()
  @IsOptional()
  questions?: QuestionAttemptDto[];
}
