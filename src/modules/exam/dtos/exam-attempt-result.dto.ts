import { ApiProperty } from '@nestjs/swagger';
import { ExamSectionDto } from './section.dto';

export class ExamAttemptResultDto {
  @ApiProperty({ description: 'ID of exam result' })
  id: number;

  @ApiProperty()
  examId: number;

  @ApiProperty()
  numCorrects: number;

  @ApiProperty({ type: 'boolean' })
  isPartial: boolean;

  @ApiProperty()
  timeTakenInSecs: number;

  @ApiProperty({ type: [ExamSectionDto] })
  sections: ExamSectionDto[];
}
