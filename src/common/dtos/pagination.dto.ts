import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto<T> {
  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly pageCount: number;

  @ApiProperty()
  readonly totalCount: number;

  @ApiProperty({ isArray: true, type: 'object' })
  readonly data: T[];
}
