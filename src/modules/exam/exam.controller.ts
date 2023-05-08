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
import { ExamDetailDto, ExamDto, ExamListItemDto } from './dtos/exam.dto';
import { ExamService } from './exam.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { IFile } from '../../common/models/IFile';
import { ExamFilterDto } from './dtos/exam-filter.dto';
import { ExamDtoParser } from '../../pipes/exam-dto-parser.pipe';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { ExamUploadDto } from './dtos/swagger/exam-upload.dto';
import { ApiResponseDto } from '../../common/dtos/api-response.dto';

@Controller('exams')
@ApiTags('exams')
@ApiExtraModels(PaginationDto)
@ApiExtraModels(ExamListItemDto)
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Get()
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
  async list(@Query() queryParams: ExamFilterDto) {
    return this.examService.list(queryParams);
  }

  @Get(':id')
  @ApiOkResponse({ type: ExamDetailDto })
  async show(@Param('id', ParseIntPipe) examId: number) {
    return this.examService.show(examId);
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'audios' }, { name: 'images' }]),
  )
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ExamUploadDto })
  @ApiCreatedResponse({ type: ApiResponseDto })
  async create(
    @Body(ExamDtoParser) examDto: Partial<ExamDto>,
    @UploadedFiles()
    files: {
      audios: IFile[];
      images: IFile[];
    },
  ) {
    await this.examService.create(examDto, files);
    return { message: 'Exam created successfully' };
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'audios' }, { name: 'images' }]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ExamUploadDto })
  @ApiOkResponse({ type: ApiResponseDto })
  async update(
    @Param('id', ParseIntPipe) examId: number,
    @Body() examDto: Partial<ExamDto>,
    @UploadedFiles()
    files: {
      audios: IFile[];
      images: IFile[];
    },
  ) {
    await this.examService.update(examId, examDto, files);
    return { message: 'Exam created successfully' };
  }

  @Delete(':id')
  @ApiOkResponse({ type: ApiResponseDto })
  async delete(@Param('id', ParseIntPipe) examId: number) {
    await this.examService.delete(examId);
    return { message: 'Exam deleted successfully' };
  }
}
