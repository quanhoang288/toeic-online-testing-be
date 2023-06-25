import { ApiProperty } from '@nestjs/swagger';

export class GroupRequestToJoinDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ nullable: true })
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  avatar?: string;
}
