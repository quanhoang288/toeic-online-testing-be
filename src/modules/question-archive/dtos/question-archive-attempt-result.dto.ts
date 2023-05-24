import { ApiProperty } from '@nestjs/swagger';
import { QuestionDto } from '../../question/dtos/question.dto';
import { QuestionSetDto } from '../../question/dtos/question-set.dto';

export class QuestionArchiveAttemptResultDto {
  @ApiProperty({ description: 'ID of question archive result' })
  id: number;

  @ApiProperty()
  questionArchiveId: number;

  @ApiProperty()
  accountId: number;

  @ApiProperty()
  numCorrects: number;

  @ApiProperty()
  timeTakenInSecs: number;

  @ApiProperty({ type: [QuestionDto] })
  questions: QuestionDto[];

  @ApiProperty({ type: [QuestionSetDto] })
  questionSets: QuestionSetDto[];
}
