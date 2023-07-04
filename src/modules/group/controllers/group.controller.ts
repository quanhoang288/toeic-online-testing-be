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
import { GroupService } from '../services/group.service';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  GroupRequestToJoinDto,
  RequestToJoinGroupResponseDto,
} from '../dtos/group-request-to-join.dto';
import { GroupDetailDto, GroupDto, GroupListItemDto } from '../dtos/group.dto';
import { ApiResponseDto } from '../../../common/dtos/api-response.dto';
import { AllowedRoles } from '../../../decorators/allowed-role.decorator';
import { Role } from '../../../common/constants/role';
import { RolesGuard } from '../../../guards/roles.guard';
import { GroupMemberDto } from '../dtos/group-member.dto';
import { GroupFilterDto } from '../dtos/group-filter.dto';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { PublicRoute } from '../../../decorators/public-route.decorator';
import { ProcessRequestToJoinGroupDto } from '../dtos/process-request-to-join-group.dto';

@Controller('groups')
@ApiTags('groups')
@ApiExtraModels(PaginationDto)
@ApiExtraModels(GroupListItemDto)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  @PublicRoute(true)
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(GroupListItemDto) },
            },
          },
        },
      ],
    },
  })
  async list(
    @Req() req: Request,
    @Query(
      new ValidationPipe({
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    filterDto: GroupFilterDto,
  ) {
    return this.groupService.list(filterDto, req.user?.id);
  }

  @Get(':id/requests-to-join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: [GroupRequestToJoinDto] })
  async getRequestList(
    @Req() req: Request,
    @Param('id', ParseIntPipe) groupId: number,
  ) {
    return this.groupService.getRequestsToJoinGroup(groupId, req.user.id);
  }

  @Get(':id/members')
  @ApiOkResponse({ type: [GroupMemberDto] })
  async getGroupMembers(@Param('id', ParseIntPipe) groupId: number) {
    return this.groupService.getGroupMembers(groupId);
  }

  @Get(':id')
  @PublicRoute(true)
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: GroupDetailDto })
  async show(@Req() req: Request, @Param('id', ParseIntPipe) groupId: number) {
    return this.groupService.show(groupId, req.user?.id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: ApiResponseDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AllowedRoles([Role.ADMIN, Role.VIP_USER])
  @ApiBody({ type: GroupDto })
  async create(@Req() req: Request, @Body() groupDto: GroupDto) {
    await this.groupService.create(groupDto, req.user.id);
    return { message: 'Create group successfully' };
  }

  @Post(':id/request-to-join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: RequestToJoinGroupResponseDto })
  async requestToJoinGroup(
    @Req() req: Request,
    @Param('id', ParseIntPipe) groupId: number,
  ) {
    return this.groupService.requestToJoinGroup(groupId, req.user.id);
  }

  @Post(':id/cancel-request-to-join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto })
  async cancelRequestToJoinGroup(
    @Req() req: Request,
    @Param('id', ParseIntPipe) groupId: number,
  ) {
    await this.groupService.cancelRequestToJoinGroup(groupId, req.user.id);
    return { message: 'Cancel request to join group successfully' };
  }

  @Post(':id/process-request-to-join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto })
  @ApiBody({
    type: ProcessRequestToJoinGroupDto,
  })
  async processRequestToJoinGroup(
    @Req() req: Request,
    @Param('id', ParseIntPipe) groupId: number,
    @Body() processRequestDto: ProcessRequestToJoinGroupDto,
  ) {
    await this.groupService.processRequestToJoinGroup(
      groupId,
      processRequestDto.userId,
      req.user.id,
      processRequestDto.accept,
    );
    return { message: 'Process request to join group successfully' };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AllowedRoles([Role.ADMIN, Role.VIP_USER])
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto })
  async update(
    @Req() req: Request,
    @Param('id', ParseIntPipe) groupId: number,
    @Body() groupDto: Partial<GroupDto>,
  ) {
    await this.groupService.update(groupId, groupDto, req.user.id);
    return { message: 'Update group successfully' };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AllowedRoles([Role.ADMIN, Role.VIP_USER])
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto })
  async delete(
    @Req() req: Request,
    @Param('id', ParseIntPipe) groupId: number,
  ) {
    await this.groupService.delete(groupId, req.user.id);
    return { message: 'Delete group successfully' };
  }
}
