import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

class SectionDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  numQuestions: number;
}

export class ExamTypeDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ nullable: true })
  @IsNumber()
  @IsOptional()
  readingPoints?: number;

  @ApiProperty({ nullable: true })
  @IsNumber()
  @IsOptional()
  listeningPoints?: number;

  @ApiProperty({ nullable: true })
  @IsNumber()
  @IsOptional()
  speakingPoints?: number;

  @ApiProperty({ nullable: true })
  @IsNumber()
  @IsOptional()
  writingPoints?: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  totalPoints: number;

  @ApiProperty({ type: [SectionDto] })
  @IsArray()
  @IsNotEmpty()
  sections: SectionDto[];
}
