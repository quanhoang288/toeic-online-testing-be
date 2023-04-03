import { Column, Entity } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

export const EXAM_TABLE_NAME = 'exams';

@Entity({ name: EXAM_TABLE_NAME })
export class ExamEntity extends AbstractEntity {
  @Column()
  name!: string;

  @Column()
  type!: string; // toeic, ielts,... default toeic only

  @Column()
  timeLimitInMins!: number;

  @Column({ default: true })
  hasMultipleSections!: boolean;

  @Column({ nullable: true })
  examSetId?: number;

  @Column({ nullable: true })
  registerStartsAt?: Date;

  @Column({ nullable: true })
  registerEndsAt?: Date;

  @Column({ nullable: true })
  startsAt?: Date;
}
