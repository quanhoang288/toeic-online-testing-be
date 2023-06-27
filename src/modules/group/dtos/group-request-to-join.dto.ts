import { ApiProperty } from '@nestjs/swagger';
import { GroupRequestToJoinStatus } from '../enums/group-request-to-join-status';

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

export class RequestToJoinGroupResponseDto {
  @ApiProperty({ enum: GroupRequestToJoinStatus })
  requestToJoinStatus: GroupRequestToJoinStatus;
}
