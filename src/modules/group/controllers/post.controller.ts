import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { Request } from 'express';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiResponseDto } from '../../../common/dtos/api-response.dto';
import { PostDto, PostUpdateDto } from '../dtos/post.dto';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { CommentDto, CommentListItemDto } from '../dtos/comment.dto';
import { PaginationOptionDto } from '../../../common/dtos/pagination-option.dto';
import { PostService } from '../services/post.service';

@Controller('posts')
@ApiTags('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @ApiBody({ type: PostDto })
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: ApiResponseDto })
  async createPost(@Req() req: Request, @Body() postDto: PostDto) {
    await this.postService.createPost(req.user.id, postDto);
    return { message: 'Create post successfully' };
  }

  @Put(':id')
  @ApiBody({ type: PostUpdateDto })
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ApiResponseDto })
  async update(
    @Param('id', ParseIntPipe) postId: number,
    @Req() req: Request,
    @Body() postDto: PostUpdateDto,
  ) {
    await this.postService.update(postId, req.user.id, postDto);
    return { message: 'Update post successfully' };
  }

  @Post(':id/process-request')
  @UseGuards(JwtAuthGuard)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        accept: {
          type: 'boolean',
          nullable: false,
        },
      },
    },
  })
  @ApiOkResponse({ type: ApiResponseDto })
  async processPostUploadRequest(
    @Req() req: Request,
    @Param('id', ParseIntPipe) postId: number,
    @Body('accept') accept: boolean,
  ) {
    await this.postService.processPostRequest(postId, req.user.id, accept);
    return { message: 'Process pending post successfully' };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ApiResponseDto })
  async deletePost(
    @Req() req: Request,
    @Param('id', ParseIntPipe) postId: number,
  ) {
    await this.postService.deletePost(postId, req.user.id);
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
    return this.postService.getComments(postId, paginationOption);
  }

  @Post(':id/comments')
  @ApiBody({ type: CommentDto })
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: ApiResponseDto })
  async createComment(
    @Req() req: Request,
    @Param('id', ParseIntPipe) postId: number,
    @Body() commentDto: CommentDto,
  ) {
    await this.postService.createComment(postId, req.user.id, commentDto);
    return { message: 'Create comment successfully' };
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ApiResponseDto })
  async likePost(
    @Req() req: Request,
    @Param('id', ParseIntPipe) postId: number,
  ) {
    await this.postService.likePost(postId, req.user.id);
    return { message: 'Like post successfully' };
  }

  @Post(':id/unlike')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ApiResponseDto })
  async unlikePost(
    @Req() req: Request,
    @Param('id', ParseIntPipe) postId: number,
  ) {
    await this.postService.unlikePost(postId, req.user.id);
    return { message: 'Unlike post successfully' };
  }
}
