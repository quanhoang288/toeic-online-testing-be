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
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { IFile } from '../../common/models/IFile';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { ApiResponseDto } from '../../common/dtos/api-response.dto';
import { QuestionArchiveService } from './question-archive.service';
import { QuestionArchiveFilterDto } from './dtos/question-archive-filter.dto';
import { QuestionArchiveDto } from './dtos/question-archive.dto';
import { QuestionArchiveDtoParser } from '../../pipes/question-archive-dto-parser.pipe';
import { QuestionArchiveUploadDto } from './dtos/swagger/question-archive-upload.dto';
import { QuestionArchiveAttemptResultDto } from './dtos/question-archive-attempt-result.dto';
import { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QuestionArchiveResultHistoryDto } from './dtos/question-archive-result-history.dto';
import { RolesGuard } from '../../guards/roles.guard';
import { PublicRoute } from '../../decorators/public-route.decorator';
import { AdminRole } from '../../decorators/admin-role.decorator';
import { PaginationOptionDto } from '../../common/dtos/pagination-option.dto';

@Controller('question-archives')
@ApiTags('question-archives')
@ApiExtraModels(PaginationDto)
@ApiExtraModels(QuestionArchiveDto)
@ApiExtraModels(QuestionArchiveResultHistoryDto)
export class QuestionArchiveController {
  constructor(
    private readonly questionArchiveService: QuestionArchiveService,
  ) {}

  @Get()
  @ApiQuery({ type: QuestionArchiveFilterDto })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(QuestionArchiveDto) },
            },
          },
        },
      ],
    },
  })
  async list(@Query() queryParams: QuestionArchiveFilterDto) {
    return this.questionArchiveService.list(queryParams);
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
              items: { $ref: getSchemaPath(QuestionArchiveResultHistoryDto) },
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
    return this.questionArchiveService.getResultHistories(
      req.user.id,
      queryParams,
    );
  }

  @Get(':id')
  @ApiOkResponse({ type: QuestionArchiveDto })
  @PublicRoute(true)
  @UseGuards(JwtAuthGuard)
  async show(
    @Req() req: ExpressRequest,
    @Param('id', ParseIntPipe) questionArchiveId: number,
  ) {
    return this.questionArchiveService.show(questionArchiveId, req.user?.id);
  }

  @Get(':id/results/:questionArchiveResultId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: QuestionArchiveAttemptResultDto })
  async getQuestionArchiveResultDetail(
    @Param('id', ParseIntPipe) questionArchiveId: number,
    @Param('questionArchiveResultId', ParseIntPipe)
    questionArchiveResultId: number,
  ) {
    return this.questionArchiveService.getAttemptResult(
      questionArchiveResultId,
    );
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'audios' }, { name: 'images' }]),
  )
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @AdminRole()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBody({ type: QuestionArchiveUploadDto })
  @ApiCreatedResponse({ type: ApiResponseDto })
  async create(
    @Body(QuestionArchiveDtoParser)
    questionArchiveDto: Partial<QuestionArchiveDto>,
    @UploadedFiles()
    files: {
      audios: IFile[];
      images: IFile[];
    },
  ) {
    await this.questionArchiveService.create(questionArchiveDto, files);
    return { message: 'Question archive created successfully' };
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'audios' }, { name: 'images' }]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @AdminRole()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBody({ type: QuestionArchiveUploadDto })
  @ApiOkResponse({ type: ApiResponseDto })
  async update(
    @Param('id', ParseIntPipe) questionArchiveId: number,
    @Body(QuestionArchiveDtoParser)
    questionArchiveDto: Partial<QuestionArchiveDto>,
    @UploadedFiles()
    files: {
      audios: IFile[];
      images: IFile[];
    },
  ) {
    await this.questionArchiveService.update(
      questionArchiveId,
      questionArchiveDto,
      files,
    );
    return { message: 'Question archive updated successfully' };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @AdminRole()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBody({ type: QuestionArchiveUploadDto })
  @ApiOkResponse({ type: ApiResponseDto })
  async delete(@Param('id', ParseIntPipe) questionArchiveId: number) {
    await this.questionArchiveService.delete(questionArchiveId);
    return { message: 'Question archive deleted successfully' };
  }
}
