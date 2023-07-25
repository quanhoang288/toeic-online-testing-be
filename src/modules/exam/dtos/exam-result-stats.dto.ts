import { ApiProperty } from '@nestjs/swagger';

class PointDistribution {
  @ApiProperty()
  point: number;

  @ApiProperty()
  freq: number;
}

class SectionCorrectPercent {
  @ApiProperty()
  sectionId: number;

  @ApiProperty()
  sectionName: string;

  @ApiProperty()
  numQuestions: number;

  @ApiProperty()
  correctPercent: number;
}

export class ExamResultStatsDto {
  @ApiProperty()
  avgTotal: number;

  @ApiProperty()
  avgListening: number;

  @ApiProperty()
  avgReading: number;

  @ApiProperty({ type: [PointDistribution] })
  totalPointDistributions: PointDistribution[];

  @ApiProperty({ type: [PointDistribution] })
  listeningPointDistributions: PointDistribution[];

  @ApiProperty({ type: [PointDistribution] })
  readingPointDistributions: PointDistribution[];

  @ApiProperty({ type: [SectionCorrectPercent] })
  correctPercentBySections: SectionCorrectPercent[];
}
