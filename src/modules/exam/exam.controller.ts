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
  UseGuards,
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
import { ExamAttemptResultDto } from './dtos/exam-attempt-result.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { AdminRole } from '../../decorators/admin-role.decorator';

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

  @Get(':id/results/:examResultId')
  @UseGuards(JwtAuthGuard)
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
  @ApiCreatedResponse({ type: ApiResponseDto })
  @AdminRole()
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @AdminRole()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'audios' }, { name: 'images' }]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ExamUploadDto })
  @ApiOkResponse({ type: ApiResponseDto })
  async update(
    @Param('id', ParseIntPipe) examId: number,
    @Body(ExamDtoParser) examDto: Partial<ExamDto>,
    @UploadedFiles()
    files: {
      audios: IFile[];
      images: IFile[];
    },
  ) {
    await this.examService.update(examId, examDto, files);
    return { message: 'Exam updated successfully' };
  }

  @Delete(':id')
  @AdminRole()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({ type: ApiResponseDto })
  async delete(@Param('id', ParseIntPipe) examId: number) {
    await this.examService.delete(examId);
    return { message: 'Exam deleted successfully' };
  }
}
