import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ExamSetService } from './exam-set.service';
import { ExamSetDto } from './dtos/exam-set.dto';

@Controller('exam-sets')
@ApiTags('exam-sets')
export class ExamSetController {
  constructor(private readonly examSetService: ExamSetService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: ExamSetDto })
  @ApiCreatedResponse({ type: ExamSetDto })
  async create(@Body() examSetDto: ExamSetDto) {
    return this.examSetService.create(examSetDto);
  }

  @Get()
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Search keyword for exam set title',
  })
  @ApiOkResponse({ type: [ExamSetDto] })
  async list(@Query('q') keyword?: string) {
    return this.examSetService.list(keyword);
  }
}
