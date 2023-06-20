import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { ExamRegistrationEntity } from './exam-registration.entity';
import { ExamSetEntity } from './exam-set.entity';
import { ExamResultEntity } from './exam-result.entity';
import { ExamTypeEntity } from './exam-type.entity';
import { ExamDetailEntity } from './exam-detail.entity';
import { ExamScope } from '../../common/constants/exam-scope';

export const EXAM_TABLE_NAME = 'exams';

@Entity({ name: EXAM_TABLE_NAME })
export class ExamEntity extends AbstractEntity {
  @Column()
  name!: string;

  @Column()
  examTypeId!: number;

  @Column({ default: true })
  hasMultipleSections!: boolean;

  @Column({ nullable: true })
  timeLimitInMins?: number;

  @Column()
  accessScope!: ExamScope;

  @Column({ nullable: true })
  examSetId?: number;

  @Column({ nullable: true })
  registerStartsAt?: Date;

  @Column({ nullable: true })
  registerEndsAt?: Date;

  @Column({ nullable: true })
  startsAt?: Date;

  @Column()
  isMiniTest!: boolean;

  @Column({ default: 0 })
  numParticipants!: number;

  @Column({ nullable: true })
  audioKey?: string;

  @OneToMany(() => ExamRegistrationEntity, (registration) => registration.exam)
  registrations: ExamRegistrationEntity[];

  @OneToMany(() => ExamResultEntity, (examResult) => examResult.exam)
  overallResults: ExamResultEntity[];

  @OneToMany(() => ExamDetailEntity, (examDetail) => examDetail.exam)
  details: ExamDetailEntity[];

  @ManyToOne(() => ExamTypeEntity)
  @JoinColumn({ name: 'exam_type_id' })
  examType: ExamTypeEntity;

  @ManyToOne(() => ExamSetEntity)
  @JoinColumn({ name: 'exam_set_id' })
  examSet: ExamSetEntity;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
