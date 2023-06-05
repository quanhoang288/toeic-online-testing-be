import { ApiProperty } from '@nestjs/swagger';

export class RoleDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}

export class AuthUserDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true, required: false })
  username?: string;

  @ApiProperty({ nullable: true, required: false })
  profileUrl?: string;

  @ApiProperty({ type: [RoleDto] })
  roles: {
    id: number;
    name: string;
  }[];

  @ApiProperty()
  isAdmin: boolean;
}
