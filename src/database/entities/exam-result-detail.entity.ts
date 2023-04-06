import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { AccountEntity } from './account.entity';
import { ExamSectionEntity } from './exam-section.entity';
import { ExamResultEntity } from './exam-result.entity';

export const EXAM_RESULT_DETAIL_TABLE_NAME = 'exam_result_details';

@Entity({ name: EXAM_RESULT_DETAIL_TABLE_NAME })
export class ExamResultDetailEntity extends AbstractEntity {
  @Column()
  examResultId: number;

  @Column({ nullable: true })
  examSectionId?: number;

  @Column()
  questionId!: number;

  @Column({ nullable: true })
  inputAnswer?: string;

  @Column({ nullable: true })
  selectedAnswerId?: number;

  @Column({ nullable: true })
  isCorrect!: boolean;

  @ManyToOne(() => ExamResultEntity)
  @JoinColumn({ name: 'exam_result_id' })
  overallResult: ExamResultEntity;

  @ManyToOne(() => AccountEntity)
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity;

  @ManyToOne(() => ExamSectionEntity)
  @JoinColumn({ name: 'exam_section_id' })
  examSection: ExamSectionEntity;
}
