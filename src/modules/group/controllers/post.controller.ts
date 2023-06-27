import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { Request } from 'express';

import { GroupChannelService } from '../services/group-channel.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiResponseDto } from '../../../common/dtos/api-response.dto';
import { PostDto } from '../dtos/post.dto';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { CommentDto, CommentListItemDto } from '../dtos/comment.dto';
import { PaginationOptionDto } from '../../../common/dtos/pagination-option.dto';

@Controller('posts')
@ApiTags('posts')
export class PostController {
  constructor(private readonly groupChannelService: GroupChannelService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: ApiResponseDto })
  async createPost(@Req() req: Request, @Body() postDto: PostDto) {
    await this.groupChannelService.createPost(req.user.id, postDto);
    return { message: 'Create post successfully' };
  }

  @Post(':id/process-request')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ApiResponseDto })
  async processPostUploadRequest(
    @Req() req: Request,
    @Param('id', ParseIntPipe) postId: number,
    @Body('accept') accept: boolean,
  ) {
    await this.groupChannelService.processPostRequest(
      postId,
      req.user.id,
      accept,
    );
    return { message: 'Process pending post successfully' };
  }

  @Delete('id')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ApiResponseDto })
  async deletePost(
    @Req() req: Request,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    await this.groupChannelService.deletePost(postId, req.user.id);
    return { message: 'Delete post successfully' };
  }

  @Get(':id/comments')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(CommentListItemDto) },
            },
          },
        },
      ],
    },
  })
  async getComments(
    @Param('id', ParseIntPipe) postId: number,
    @Query(
      new ValidationPipe({
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    paginationOption: PaginationOptionDto,
  ) {
    return this.groupChannelService.getComments(postId, paginationOption);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: ApiResponseDto })
  async createComment(
    @Req() req: Request,
    @Param('id', ParseIntPipe) postId: number,
    @Body() commentDto: CommentDto,
  ) {
    await this.groupChannelService.createComment(
      postId,
      req.user.id,
      commentDto,
    );
    return { message: 'Create comment successfully' };
  }
}
