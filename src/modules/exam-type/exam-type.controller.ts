import { Controller, Get } from '@nestjs/common';
import { ExamTypeService } from './exam-type.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ExamTypeDto } from './dtos/exam-type.dto';

@Controller('exam-types')
@ApiTags('exam-types')
export class ExamTypeController {
  constructor(private readonly examTypeService: ExamTypeService) {}

  @Get()
  @ApiOkResponse({ type: [ExamTypeDto] })
  async getExamTypes() {
    return this.examTypeService.getExamTypes();
  }
}
