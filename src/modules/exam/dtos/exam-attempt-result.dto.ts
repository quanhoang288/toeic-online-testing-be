import { ApiProperty } from '@nestjs/swagger';
import { ExamSectionDto } from './section.dto';

export class ExamAttemptResultDto {
  @ApiProperty({ description: 'ID of exam result' })
  id: number;

  @ApiProperty()
  examId: number;

  @ApiProperty()
  examName: string;

  @ApiProperty()
  numCorrects: number;

  @ApiProperty({ nullable: true, required: false })
  listeningPoints?: number;

  @ApiProperty({ nullable: true, required: false })
  readingPoints?: number;

  @ApiProperty({ nullable: true, required: false })
  totalPoints?: number;

  @ApiProperty({ type: 'boolean' })
  isPartial: boolean;

  @ApiProperty()
  timeTakenInSecs: number;

  @ApiProperty({ type: [ExamSectionDto] })
  sections: ExamSectionDto[];
}
