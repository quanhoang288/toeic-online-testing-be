import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GradingService } from './services/grading.service';
import { ExamAttemptDto } from './dtos/exam-attempt.dto';
import { QuestionArchiveAttemptDto } from './dtos/question-archive-attempt.dto';
import { AttemptResult } from './dtos/attempt-result.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('grading')
@ApiTags('grading')
export class GradingController {
  constructor(private readonly gradingService: GradingService) {}

  @Post('exams')
  @ApiBody({ type: ExamAttemptDto })
  @ApiOkResponse({ type: AttemptResult })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async gradeExam(@Req() req: Request, @Body() examAttemptDto: ExamAttemptDto) {
    return this.gradingService.evaluateExamAttempt(
      examAttemptDto,
      req.user?.id,
    );
  }

  @Post('question-archives')
  @ApiBody({ type: QuestionArchiveAttemptDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: AttemptResult })
  async gradeQuestionArchive(
    @Req() req: Request,
    @Body() questionArchiveAttemptDto: QuestionArchiveAttemptDto,
  ) {
    return this.gradingService.evaluateQuestionArchiveAttempt(
      questionArchiveAttemptDto,
      req.user?.id,
    );
  }
}
