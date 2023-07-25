import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ExamDetailDto, ExamDto, ExamListItemDto } from './dtos/exam.dto';
import { ExamService } from './exam.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { IFile } from '../../common/models/IFile';
import { ExamFilterDto } from './dtos/exam-filter.dto';
import { ExamDtoParser } from '../../pipes/exam-dto-parser.pipe';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { ExamUploadDto } from './dtos/swagger/exam-upload.dto';
import { ApiResponseDto } from '../../common/dtos/api-response.dto';
import { ExamAttemptResultDto } from './dtos/exam-attempt-result.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Request as ExpressRequest } from 'express';
import { PublicRoute } from '../../decorators/public-route.decorator';
import { ExamResultHistoryDto } from './dtos/exam-result-history.dto';
import { PaginationOptionDto } from '../../common/dtos/pagination-option.dto';
import { UserProgressFilterDto } from './dtos/user-progress-filter.dto';
import { UserProgressDto } from './dtos/user-progress.dto';
import { AllowedRoles } from 'src/decorators/allowed-role.decorator';
import { Role } from 'src/common/constants/role';
import { ExamResultStatsDto } from './dtos/exam-result-stats.dto';

@Controller('exams')
@ApiTags('exams')
@ApiExtraModels(PaginationDto)
@ApiExtraModels(ExamListItemDto)
@ApiExtraModels(ExamResultHistoryDto)
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Get()
  @PublicRoute(true)
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ type: ExamFilterDto })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(ExamListItemDto) },
            },
          },
        },
      ],
    },
  })
  async list(
    @Req() req: ExpressRequest,
    @Query(
      new ValidationPipe({
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    queryParams: ExamFilterDto,
  ) {
    return this.examService.list(queryParams, req.user?.id);
  }

  @Get('result-histories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(ExamResultHistoryDto) },
            },
          },
        },
      ],
    },
  })
  async getResultHistories(
    @Req() req: ExpressRequest,
    @Query(
      new ValidationPipe({
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    queryParams: PaginationOptionDto,
  ) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    return this.examService.getResultHistories(req.user.id, queryParams);
  }

  @Get('user-progress')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiQuery({ type: UserProgressFilterDto })
  @ApiOkResponse({ type: UserProgressDto })
  async getUserProgress(
    @Req() req: ExpressRequest,
    @Query(
      new ValidationPipe({
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    filterDto: UserProgressFilterDto,
  ) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    return this.examService.getUserProgress(
      req.user.id,
      filterDto.from,
      filterDto.to,
    );
  }

  @Get(':id')
  @ApiOkResponse({ type: ExamDetailDto })
  @PublicRoute(true)
  @UseGuards(JwtAuthGuard)
  async show(
    @Req() req: ExpressRequest,
    @Param('id', ParseIntPipe) examId: number,
  ) {
    return this.examService.show(examId, req.user?.id);
  }

  @Get(':id/result-stats')
  @ApiOkResponse({ type: ExamResultStatsDto })
  async getResultStats(@Param('id', ParseIntPipe) examId: number) {
    return this.examService.getResultStats(examId);
  }

  @Get(':id/results/:examResultId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ExamAttemptResultDto })
  async getExamResultDetail(
    @Param('id', ParseIntPipe) examId: number,
    @Param('examResultId', ParseIntPipe) examResultId: number,
  ) {
    return this.examService.getAttemptResult(examResultId);
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'audios' }, { name: 'images' }]),
  )
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ExamUploadDto })
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: ApiResponseDto })
  @AllowedRoles([Role.ADMIN, Role.VIP_USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(
    @Req() req: ExpressRequest,
    @Body(ExamDtoParser) examDto: Partial<ExamDto>,
    @UploadedFiles()
    files: {
      audios: IFile[];
      images: IFile[];
    },
  ) {
    await this.examService.create(examDto, files, req.user?.id);
    return { message: 'Exam created successfully' };
  }

  @Put(':id')
  @AllowedRoles([Role.ADMIN, Role.VIP_USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'audios' }, { name: 'images' }]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ExamUploadDto })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto })
  async update(
    @Req() req: ExpressRequest,
    @Param('id', ParseIntPipe) examId: number,
    @Body(ExamDtoParser) examDto: Partial<ExamDto>,
    @UploadedFiles()
    files: {
      audios: IFile[];
      images: IFile[];
    },
  ) {
    await this.examService.update(examId, req.user?.id, examDto, files);
    return { message: 'Exam updated successfully' };
  }

  @Delete(':id')
  @AllowedRoles([Role.ADMIN, Role.VIP_USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto })
  async delete(
    @Req() req: ExpressRequest,
    @Param('id', ParseIntPipe) examId: number,
  ) {
    await this.examService.delete(examId, req.user?.id);
    return { message: 'Exam deleted successfully' };
  }

  @Post(':examId/register')
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'examId' })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiResponseDto })
  async registerForExam(
    @Req() req: ExpressRequest,
    @Param('examId', ParseIntPipe) examId: number,
  ) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    await this.examService.register(examId, req.user.id);
    return { message: 'Registered exam successfully' };
  }

  @Post(':examId/cancel-registration')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'examId' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto })
  async cancelExamRegistration(
    @Req() req: ExpressRequest,
    @Param('examId', ParseIntPipe) examId: number,
  ) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    await this.examService.cancelRegistration(examId, req.user?.id);
    return { message: 'Cancelled exam registration successfully' };
  }
}
