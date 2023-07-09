import { ApiProperty } from '@nestjs/swagger';

class StatsItem {
  @ApiProperty()
  numAccounts: number;

  @ApiProperty()
  numUpgrades: number;

  @ApiProperty()
  numExamAttempts: number;

  @ApiProperty()
  numQuestionArchiveAttempts: number;

  @ApiProperty()
  revenue: number;
}

export class TodayStats {
  @ApiProperty({ type: StatsItem })
  today: StatsItem;

  @ApiProperty({ type: StatsItem })
  yesterday: StatsItem;
}
