import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { IFile } from 'src/common/models/file';
import { AnswerDto } from './answer.dto';

export class QuestionDto {
  examSectionId?: number;

  questionSetId?: number;

  @ApiProperty()
  type: string;

  @ApiProperty({ nullable: true })
  text?: string;

  @ApiProperty({ nullable: true })
  imageFile?: IFile;

  @ApiProperty({ nullable: true })
  imageUrl?: string;

  @ApiProperty({ nullable: true })
  explanation?: string;

  @ApiProperty()
  @IsArray()
  answers: AnswerDto[];
}
