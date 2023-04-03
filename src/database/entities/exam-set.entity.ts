import { Column, Entity } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

export const EXAM_SET_TABLE_NAME = 'exam_sets';

@Entity({ name: EXAM_SET_TABLE_NAME })
export class ExamSetEntity extends AbstractEntity {
  @Column()
  title: string;

  @Column({ nullable: true })
  description!: string;
}
