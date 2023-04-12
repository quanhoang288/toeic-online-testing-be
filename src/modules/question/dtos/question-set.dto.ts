import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';
import { IFile } from 'src/common/models/file';
import { QuestionDto } from './question.dto';

export class QuestionSetDto {
  examSectionId?: number;

  @ApiProperty({ nullable: true })
  title?: string;

  @ApiProperty({ nullable: true })
  textContent?: string;

  @ApiProperty({ nullable: true })
  imageFiles?: IFile[];

  @ApiProperty({ nullable: true })
  audioFile?: IFile;

  @ApiProperty({ nullable: true })
  gaps?: string[];

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  questions: QuestionDto[];
}
