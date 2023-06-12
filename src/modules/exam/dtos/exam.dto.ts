import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ExamSectionDto } from './section.dto';
import { Type } from 'class-transformer';
import { ExamRegistrationStatus } from '../../../common/constants/exam-registration-status';

export class ExamDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  examTypeId?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  hasMultipleSections?: boolean;

  @ApiProperty({ nullable: true, required: false })
  @IsNumber()
  @IsOptional()
  timeLimitInMins?: number;

  @ApiProperty({ nullable: true, required: false })
  @IsString()
  @IsOptional()
  registerStartsAt?: string;

  @ApiProperty({ nullable: true, required: false })
  @IsString()
  @IsOptional()
  registerEndsAt?: string;

  @ApiProperty({ nullable: true, required: false })
  @IsString()
  @IsOptional()
  startsAt?: string;

  @ApiProperty({ nullable: true, required: false })
  @IsBoolean()
  @IsOptional()
  isMiniTest?: boolean;

  @ApiProperty({ type: [ExamSectionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamSectionDto)
  @IsNotEmpty()
  sections: ExamSectionDto[];

  @ApiProperty({ nullable: true })
  @IsNumber()
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

  @ApiProperty({ nullable: true, required: false })
  registrationStatus?: ExamRegistrationStatus;
}
