import { IsDate, IsNumber, IsOptional } from 'class-validator';
import { PaginationOptionDto } from '../../../common/dtos/pagination-option.dto';

export class ExamFilterDto extends PaginationOptionDto {
  @IsOptional()
  @IsDate()
  readonly registerTimeFrom?: string;

  @IsOptional()
  @IsDate()
  readonly registerTimeTo?: string;

  @IsOptional()
  @IsDate()
  readonly startTimeFrom?: string;

  @IsOptional()
  @IsDate()
  readonly startTimeTo?: string;

  @IsOptional()
  @IsNumber()
  readonly examSetId?: number;
}
