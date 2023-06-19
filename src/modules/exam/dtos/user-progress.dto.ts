import { ApiProperty } from '@nestjs/swagger';

class AverageStatBySectionItem {
  @ApiProperty()
  sectionId: number;

  @ApiProperty()
  sectionName: string;

  @ApiProperty()
  numQuestions: number;

  @ApiProperty()
  numCorrects: number;
}

class ExamResultHistoryItem {
  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  listeningPoints: number;

  @ApiProperty()
  readingPoints: number;

  @ApiProperty()
  totalPoints: number;
}

class ExamResultStatItem {
  @ApiProperty()
  avgTotal: number;

  @ApiProperty()
  avgListening: number;

  @ApiProperty()
  avgReading: number;

  @ApiProperty({ type: [AverageStatBySectionItem] })
  avgBySections: AverageStatBySectionItem[];
}

export class UserProgressDto {
  @ApiProperty({ type: [ExamResultHistoryItem] })
  histories: ExamResultHistoryItem[];

  @ApiProperty({ type: ExamResultStatItem })
  stats: ExamResultStatItem;
}
