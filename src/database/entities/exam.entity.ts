import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { ExamRegistrationEntity } from './exam-registration.entity';
import { ExamSetEntity } from './exam-set.entity';
import { ExamResultEntity } from './exam-result.entity';
import { ExamSectionEntity } from './exam-section.entity';

export const EXAM_TABLE_NAME = 'exams';

@Entity({ name: EXAM_TABLE_NAME })
export class ExamEntity extends AbstractEntity {
  @Column()
  name!: string;

  @Column()
  type!: string; // toeic, ielts,... default toeic only

  @Column({ default: true })
  hasMultipleSections!: boolean;

  @Column({ nullable: true })
  timeLimitInMins?: number;

  @Column({ nullable: true })
  examSetId?: number;

  @Column({ nullable: true })
  registerStartsAt?: Date;

  @Column({ nullable: true })
  registerEndsAt?: Date;

  @Column({ nullable: true })
  startsAt?: Date;

  @Column({ nullable: true })
  numParticipants?: number;

  @Column({ nullable: true })
  audio?: string;

  @OneToMany(() => ExamRegistrationEntity, (registration) => registration.exam)
  registrations: ExamRegistrationEntity[];

  @OneToMany(() => ExamResultEntity, (examResult) => examResult.exam)
  overallResults: ExamResultEntity[];

  @OneToMany(() => ExamSectionEntity, (examSection) => examSection.exam)
  examSections: ExamSectionEntity[];

  @ManyToOne(() => ExamSetEntity)
  @JoinColumn({ name: 'exam_set_id' })
  examSet: ExamSetEntity;
}
