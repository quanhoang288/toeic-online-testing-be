import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

class PostCreator {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username?: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  avatar?: string;
}

export class PostDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  channelId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}

export class PostListItem extends PostDto {
  @ApiProperty()
  isApproved: boolean;

  @ApiProperty({ type: PostCreator })
  creator: PostCreator;
}
