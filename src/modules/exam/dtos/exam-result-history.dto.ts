import { ApiProperty } from '@nestjs/swagger';

export class ExamResultHistoryDto {
  @ApiProperty()
  examResultId: number;

  @ApiProperty()
  examId: number;

  @ApiProperty()
  examName: string;

  @ApiProperty()
  isMiniTest: boolean;

  @ApiProperty()
  isPartial: boolean;

  @ApiProperty()
  numCorrects: number;

  @ApiProperty()
  numQuestions: number;

  @ApiProperty({ nullable: true })
  listeningPoints?: number;

  @ApiProperty({ nullable: true })
  readingPoints?: number;

  @ApiProperty({ nullable: true })
  totalPoints?: number;

  @ApiProperty()
  timeTakenInSecs: number;

  @ApiProperty()
  createdAt: Date;
}
