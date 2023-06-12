import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { QuestionDto } from './question.dto';
import { Type } from 'class-transformer';

export class QuestionSetDto {
  sectionId?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @ApiProperty({ nullable: true, type: [Number] })
  imageFileIndices?: number[];

  @ApiProperty({ nullable: true })
  imageKeys?: string[];

  @ApiProperty({ nullable: true, type: Number })
  @IsNumber()
  @IsOptional()
  audioFileIndex?: number;

  @ApiProperty({ nullable: true })
  audioKey?: string;

  @ApiProperty({ type: [QuestionDto] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}
