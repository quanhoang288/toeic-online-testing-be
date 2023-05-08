import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { ExamSetService } from './exam-set.service';
import { ExamSetDto } from './dtos/exam-set.dto';

@Controller('exam-sets')
export class ExamSetController {
  constructor(private readonly examSetService: ExamSetService) {}

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse()
  async create(@Body() examSetDto: ExamSetDto) {
    return this.examSetService.create(examSetDto);
  }
}
