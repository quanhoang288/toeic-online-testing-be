import { ApiProperty } from '@nestjs/swagger';

export class TodayStats {
  @ApiProperty()
  numAccounts: number;

  @ApiProperty()
  numUpgrades: number;

  @ApiProperty()
  numExams: number;

  @ApiProperty()
  numVipExams: number;

  @ApiProperty()
  numQuestionArchives: number;

  @ApiProperty()
  revenue: number;

  @ApiProperty()
  revenueYesterday: number;
}
