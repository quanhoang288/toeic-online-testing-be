import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { ExamEntity } from './exam.entity';

export const EXAM_SET_TABLE_NAME = 'exam_sets';

@Entity({ name: EXAM_SET_TABLE_NAME })
export class ExamSetEntity extends AbstractEntity {
  @Column()
  title: string;

  @Column({ nullable: true })
  description!: string;

  @OneToMany(() => ExamEntity, (exam) => exam.examSet)
  exams: ExamEntity[];
}
