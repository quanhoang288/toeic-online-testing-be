import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

class CommentCreator {
  @ApiProperty()
  id: number;

  @ApiProperty({ nullable: true })
  username?: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  avatar?: string;
}

export class CommentDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  postId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class CommentListItemDto extends CommentDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ type: CommentCreator })
  creator: CommentCreator;
}
