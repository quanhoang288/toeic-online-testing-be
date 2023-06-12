import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { ExamEntity } from './exam.entity';
import { AccountEntity } from './account.entity';
import { ExamRegistrationStatus } from '../../common/constants/exam-registration-status';

export const EXAM_REGISTRATION_TABLE_NAME = 'exam_registrations';

@Entity({ name: EXAM_REGISTRATION_TABLE_NAME })
export class ExamRegistrationEntity extends AbstractEntity {
  @Column()
  examId!: number;

  @Column()
  accountId!: number;

  @Column()
  status!: ExamRegistrationStatus;

  @ManyToOne(() => ExamEntity, (exam) => exam.registrations)
  @JoinColumn({ name: 'exam_id' })
  exam: ExamEntity;

  @ManyToOne(() => AccountEntity, (account) => account.examRegistrations)
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity;
}
