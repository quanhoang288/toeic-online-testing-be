import { ApiProperty } from '@nestjs/swagger';
import { PaginationOptionDto } from '../../../common/dtos/pagination-option.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class PostFilterDto extends PaginationOptionDto {
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  sortOption?: string;
}
