import { ApiProperty } from '@nestjs/swagger';

class AccountStatsItem {
  @ApiProperty()
  timestampCol: string;

  @ApiProperty()
  cnt: number;
}

class RevenueStatsItem {
  @ApiProperty()
  timestampCol: string;

  @ApiProperty()
  revenue: number;
}

class ExamAttemptStatsItem {
  @ApiProperty()
  timestampCol: string;

  @ApiProperty()
  cnt: number;
}

class QuestionArchiveAttemptStatsItem extends ExamAttemptStatsItem {}

export class StatsByDate {
  @ApiProperty({ type: [AccountStatsItem] })
  accountStats: AccountStatsItem[];

  @ApiProperty({ type: [RevenueStatsItem] })
  revenueStats: RevenueStatsItem[];

  @ApiProperty({ type: [ExamAttemptStatsItem] })
  examAttemptStats: ExamAttemptStatsItem[];

  @ApiProperty({ type: [QuestionArchiveAttemptStatsItem] })
  questionArchiveAttemptStats: QuestionArchiveAttemptStatsItem[];
}
