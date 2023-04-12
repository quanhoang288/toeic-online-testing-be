import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { QuestionSetDto } from 'src/modules/question/dtos/question-set.dto';
import { QuestionDto } from 'src/modules/question/dtos/question.dto';

export class ExamSectionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  numQuestions: number;

  @ApiProperty({ nullable: true })
  @IsArray()
  questions?: QuestionDto[];

  @ApiProperty({ nullable: true })
  @IsArray()
  questionSets?: QuestionSetDto[];
}
