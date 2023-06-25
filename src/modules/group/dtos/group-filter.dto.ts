import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationOptionDto } from '../../../common/dtos/pagination-option.dto';

export class GroupFilterDto extends PaginationOptionDto {
  @ApiProperty({ nullable: false, required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ nullable: false, required: false })
  @IsBoolean()
  @IsOptional()
  joined?: boolean;
}
