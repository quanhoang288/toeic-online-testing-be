import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GradingService } from './services/grading.service';
import { ExamAttemptDto } from './dtos/exam-attempt.dto';
import { QuestionArchiveAttemptDto } from './dtos/question-archive-attempt.dto';
import { AttemptResult } from './dtos/attempt-result.dto';

@Controller('grading')
@ApiTags('grading')
export class GradingController {
  constructor(private readonly gradingService: GradingService) {}

  @Post('exams')
  @ApiBody({ type: ExamAttemptDto })
  @ApiOkResponse({ type: AttemptResult })
  async gradeExam(@Body() examAttemptDto: ExamAttemptDto) {
    return this.gradingService.evaluateExamAttempt(examAttemptDto);
  }

  @Post('question-archives')
  @ApiBody({ type: QuestionArchiveAttemptDto })
  @ApiOkResponse({ type: AttemptResult })
  async gradeQuestionArchive(
    @Body() questionArchiveAttemptDto: QuestionArchiveAttemptDto,
  ) {
    return this.gradingService.evaluateQuestionArchiveAttempt(
      questionArchiveAttemptDto,
    );
  }
}
