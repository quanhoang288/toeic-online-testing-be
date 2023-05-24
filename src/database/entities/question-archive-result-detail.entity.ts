import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { QuestionArchiveResultEntity } from './question-archive-result.entity';

export const QUESTION_ARCHIVE_RESULT_DETAIL_TABLE_NAME =
  'question_archive_result_details';

@Entity({ name: QUESTION_ARCHIVE_RESULT_DETAIL_TABLE_NAME })
export class QuestionArchiveResultDetailEntity extends AbstractEntity {
  @Column()
  questionArchiveResultId!: number;

  @Column()
  questionId!: number;

  @Column({ nullable: true })
  selectedAnswerId?: number;

  @Column()
  isCorrect!: boolean;

  @ManyToOne(() => QuestionArchiveResultEntity)
  @JoinColumn({ name: 'question_archive_result_id' })
  overallResult: QuestionArchiveResultEntity;
}
