import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ExamSectionDto } from './section.dto';

export class ExamDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  examTypeId: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  hasMultipleSections: boolean;

  @ApiProperty({ nullable: true, required: false })
  @IsNumber()
  @IsOptional()
  timeLimitInMins?: number;

  @ApiProperty({ nullable: true, required: false })
  @IsDate()
  @IsOptional()
  registerStartsAt?: string;

  @ApiProperty({ nullable: true, required: false })
  @IsDate()
  @IsOptional()
  registerEndsAt?: string;

  @ApiProperty({ nullable: true, required: false })
  @IsDate()
  @IsOptional()
  startsAt?: string;

  @ApiProperty({ nullable: true, required: false })
  @IsBoolean()
  @IsOptional()
  isMiniTest?: boolean;

  @ApiProperty({ type: [ExamSectionDto] })
  @IsArray()
  @IsNotEmpty()
  sections: ExamSectionDto[];

  @ApiProperty({ nullable: true })
  @IsOptional()
  examSetId?: number;
}

export class ExamListItemDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  isMiniTest: boolean;

  @ApiProperty({ nullable: true, required: false })
  examSet?: string;

  @ApiProperty({ nullable: true, required: false })
  registerStartsAt?: string;

  @ApiProperty({ nullable: true, required: false })
  registerEndsAt?: string;

  @ApiProperty({ nullable: true, required: false })
  startsAt?: string;

  @ApiProperty({ default: 0 })
  numParticipants: number;
}

class ExamResult {
  @ApiProperty()
  id: number;

  @ApiProperty()
  isPartial: boolean;

  @ApiProperty()
  numCorrects: number;

  @ApiProperty()
  timeTakenInSecs: number;
}

export class ExamDetailDto extends ExamDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ default: 0 })
  numParticipants: number;

  @ApiProperty({ type: [ExamResult], nullable: true, required: false })
  examResults?: ExamResult[];
}
