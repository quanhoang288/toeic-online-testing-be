import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiOkResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';

import { GroupChannelService } from '../services/group-channel.service';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { PostListItem } from '../dtos/post.dto';
import { PostFilterDto } from '../dtos/post-filter.dto';

@Controller('group-channels')
@ApiTags('group-channels')
export class GroupChannelController {
  constructor(private readonly groupChannelService: GroupChannelService) {}

  @Get(':id/posts')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(PostListItem) },
            },
          },
        },
      ],
    },
  })
  async getPosts(
    @Req() req: Request,
    @Param('id', ParseIntPipe) channelId: number,
    @Query(
      new ValidationPipe({
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    filterDto: PostFilterDto,
  ) {
    return this.groupChannelService.getPosts(
      channelId,
      filterDto,
      req.user?.id,
    );
  }
}
