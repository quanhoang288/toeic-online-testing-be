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

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  hasMultipleSections: boolean;

  @ApiProperty({ nullable: true })
  @IsNumber()
  @IsOptional()
  timeLimitInMins?: number;

  @ApiProperty({ nullable: true })
  @IsDate()
  @IsOptional()
  registerStartsAt?: string;

  @ApiProperty({ nullable: true })
  @IsDate()
  @IsOptional()
  registerEndsAt?: string;

  @ApiProperty({ nullable: true })
  @IsDate()
  @IsOptional()
  startsAt?: string;

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

  @ApiProperty({ nullable: true })
  registerStartsAt?: string;

  @ApiProperty({ nullable: true })
  registerEndsAt?: string;

  @ApiProperty({ nullable: true })
  startsAt?: string;

  @ApiProperty({ default: 0 })
  numParticipants: number;
}

export class ExamDetailDto extends ExamDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ default: 0 })
  numParticipants: number;
}
