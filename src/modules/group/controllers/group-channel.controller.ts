import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';

import { GroupChannelService } from '../services/group-channel.service';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { PostListItem } from '../dtos/post.dto';
import { PostFilterDto } from '../dtos/post-filter.dto';
import { PublicRoute } from '../../../decorators/public-route.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('group-channels')
@ApiTags('group-channels')
@ApiExtraModels(PaginationDto)
@ApiExtraModels(PostListItem)
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
  @PublicRoute(true)
  @UseGuards(JwtAuthGuard)
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
