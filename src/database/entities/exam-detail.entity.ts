import { Column, Entity } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

export const EXAM_DETAIL_TABLE_NAME = 'exam_details';

@Entity({ name: EXAM_DETAIL_TABLE_NAME })
export class ExamDetailEntity extends AbstractEntity {
  @Column()
  examId!: number;

  @Column({ nullable: true })
  examSectionId!: number;

  @Column()
  questionId!: number;

  @Column()
  questionSetId!: number;
}
