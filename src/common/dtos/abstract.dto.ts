import { ApiProperty } from '@nestjs/swagger';

export class AbstractDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(data: { id: number; createdAt: Date; updatedAt: Date }) {
    Object.assign(this, data);
  }
}
