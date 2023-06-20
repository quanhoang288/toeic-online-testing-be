import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { ExamEntity } from './exam.entity';
import { AccountEntity } from './account.entity';
import { ExamResultDetailEntity } from './exam-result-detail.entity';
import { ExamResultBySectionEntity } from './exam-result-by-section.entity';

export const EXAM_RESULT_TABLE_NAME = 'exam_results';

@Entity({ name: EXAM_RESULT_TABLE_NAME })
export class ExamResultEntity extends AbstractEntity {
  @Column()
  examId!: number;

  @Column()
  accountId!: number;

  @Column({ default: false })
  isVirtual!: boolean;

  @Column({ default: false })
  isPartial!: boolean;

  @Column()
  numCorrects!: number;

  @Column()
  numQuestions!: number;

  @Column({ nullable: true })
  listeningPoints?: number;

  @Column({ nullable: true })
  readingPoints?: number;

  @Column({ nullable: true })
  totalPoints?: number;

  @Column()
  timeTakenInSecs!: number;

  @OneToMany(
    () => ExamResultDetailEntity,
    (detailResult) => detailResult.overallResult,
  )
  detailResults: ExamResultDetailEntity[];

  @OneToMany(
    () => ExamResultBySectionEntity,
    (resultBySection) => resultBySection.examResult,
  )
  resultsBySection: ExamResultBySectionEntity[];

  @ManyToOne(() => ExamEntity, (exam) => exam.overallResults)
  @JoinColumn({ name: 'exam_id' })
  exam: ExamEntity;

  @ManyToOne(() => AccountEntity, (account) => account.examResults)
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity;
}
