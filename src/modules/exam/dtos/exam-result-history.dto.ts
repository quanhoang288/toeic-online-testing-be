import { ApiProperty } from '@nestjs/swagger';

export class ExamResultHistoryDto {
  @ApiProperty()
  examResultId: number;

  @ApiProperty()
  examId: number;

  @ApiProperty()
  examName: string;

  @ApiProperty()
  numCorrects: number;

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
