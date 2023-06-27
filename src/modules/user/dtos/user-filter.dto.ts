import { ApiProperty } from '@nestjs/swagger';
import { PaginationOptionDto } from '../../../common/dtos/pagination-option.dto';
import { IsOptional } from 'class-validator';

export class UserFilterDto extends PaginationOptionDto {
  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  groupId?: number;
}
