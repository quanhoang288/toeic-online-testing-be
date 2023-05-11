import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { ExamEntity } from './exam.entity';
import { AccountEntity } from './account.entity';

export const EXAM_REGISTRATION_TABLE_NAME = 'exam_registrations';

@Entity({ name: EXAM_REGISTRATION_TABLE_NAME })
export class ExamRegistrationEntity extends AbstractEntity {
  @Column()
  examId!: number;

  @Column()
  accountId!: number;

  @Column({ default: 'accepted' })
  status!: string;

  @ManyToOne(() => ExamEntity, (exam) => exam.registrations)
  @JoinColumn({ name: 'exam_id' })
  exam: ExamEntity;

  @ManyToOne(() => AccountEntity, (account) => account.examRegistrations)
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity;
}
