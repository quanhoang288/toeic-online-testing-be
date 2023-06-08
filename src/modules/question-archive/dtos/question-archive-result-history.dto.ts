import { ApiProperty } from '@nestjs/swagger';

export class QuestionArchiveResultHistoryDto {
  @ApiProperty()
  questionArchiveResultId: number;

  @ApiProperty()
  questionArchiveId: number;

  @ApiProperty()
  questionArchiveName: string;

  @ApiProperty()
  numCorrects: number;

  @ApiProperty()
  totalQuestions: number;

  @ApiProperty()
  timeTakenInSecs: number;

  @ApiProperty()
  createdAt: Date;
}
