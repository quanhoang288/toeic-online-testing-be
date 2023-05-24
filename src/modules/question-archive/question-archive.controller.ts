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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
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

@Controller('question-archives')
@ApiTags('question-archives')
@ApiExtraModels(PaginationDto)
@ApiExtraModels(QuestionArchiveDto)
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

  @Get(':id')
  @ApiOkResponse({ type: QuestionArchiveDto })
  async show(@Param('id', ParseIntPipe) questionArchiveId: number) {
    return this.questionArchiveService.show(questionArchiveId);
  }

  @Get(':id/results/:questionArchiveResultId')
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
  @ApiOkResponse({ type: ApiResponseDto })
  async delete(@Param('id', ParseIntPipe) questionArchiveId: number) {
    await this.questionArchiveService.delete(questionArchiveId);
    return { message: 'Question archive deleted successfully' };
  }
}
