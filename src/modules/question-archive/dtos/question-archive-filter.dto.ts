import { IsNumber, IsOptional } from 'class-validator';
import { PaginationOptionDto } from '../../../common/dtos/pagination-option.dto';

export class QuestionArchiveFilterDto extends PaginationOptionDto {
  @IsOptional()
  @IsNumber()
  readonly sectionId?: number;
}
