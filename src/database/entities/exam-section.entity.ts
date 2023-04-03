import { Column, Entity } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

export const EXAM_SECTION_TABLE_NAME = 'exam_sections';

@Entity({ name: EXAM_SECTION_TABLE_NAME })
export class ExamSectionEntity extends AbstractEntity {
  @Column()
  examId!: number;

  @Column()
  name!: string;

  @Column()
  numQuestions!: number;
}
