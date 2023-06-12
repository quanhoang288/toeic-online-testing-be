import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationOptionDto } from '../../../common/dtos/pagination-option.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ExamFilterDto extends PaginationOptionDto {
  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  readonly registerTimeFromAfterOrEqual?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  readonly registerTimeFromBeforeOrEqual?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  readonly registerTimeToAfterOrEqual?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  readonly registerTimeToBeforeOrEqual?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  readonly startTimeAfterOrEqual?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  readonly startTimeBeforeOrEqual?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  readonly isMiniTest?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsNumber()
  readonly examSetId?: number;
}
