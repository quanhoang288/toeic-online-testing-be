import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { IFile } from 'src/common/models/file';
import { ExamSectionDto } from './section.dto';

export class ExamDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty()
  @IsBoolean()
  hasMultipleSections: boolean;

  @ApiProperty({ nullable: true })
  @IsNumber()
  timeLimitInMins?: number;

  @ApiProperty({ nullable: true })
  @IsDate()
  registerStartsAt?: string;

  @ApiProperty({ nullable: true })
  @IsDate()
  registerEndsAt?: string;

  @ApiProperty({ nullable: true })
  @IsDate()
  startsAt?: string;

  @ApiProperty({ nullable: true })
  audioFile?: IFile;

  @ApiProperty()
  @IsArray()
  sections: ExamSectionDto[];

  @ApiProperty({ nullable: true })
  examSet?: string | number;
}
