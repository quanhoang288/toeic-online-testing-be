import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { GroupMemberDto } from './group-member.dto';
import { GroupChannelDto } from './group-channel.dto';
import { GroupRequestToJoinDto } from './group-request-to-join.dto';

export class GroupDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isPublic: boolean;

  @ApiProperty({ type: [GroupChannelDto], required: false, nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupChannelDto)
  channels?: GroupChannelDto[];

  @ApiProperty({ type: [GroupMemberDto], required: false, nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupMemberDto)
  members?: GroupMemberDto[];

  @ApiProperty({
    type: [GroupRequestToJoinDto],
    description: 'Request to join list. Used for detail API',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupRequestToJoinDto)
  requestsToJoin?: GroupRequestToJoinDto[];
}

export class GroupListItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  isPublic: boolean;

  @ApiProperty({ nullable: true, required: false })
  requestToJoinStatus?: string;
}
