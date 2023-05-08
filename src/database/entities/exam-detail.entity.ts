import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { ExamEntity } from './exam.entity';
import { QuestionEntity } from './question.entity';
import { QuestionSetEntity } from './question-set.entity';
import { SectionEntity } from './section.entity';

export const EXAM_DETAIL_TABLE_NAME = 'exam_details';

@Entity({ name: EXAM_DETAIL_TABLE_NAME })
export class ExamDetailEntity extends AbstractEntity {
  @Column()
  examId!: number;

  @Column({ nullable: true })
  sectionId?: number;

  @Column({ nullable: true })
  questionId?: number;

  @Column({ nullable: true })
  questionSetId?: number;

  @Column({ nullable: true })
  displayOrder?: number;

  @ManyToOne(() => ExamEntity)
  @JoinColumn({ name: 'exam_id' })
  exam: ExamEntity;

  @ManyToOne(() => SectionEntity)
  @JoinColumn({ name: 'section_id' })
  section: SectionEntity;

  @ManyToOne(() => QuestionEntity)
  @JoinColumn({ name: 'question_id' })
  question: QuestionEntity;

  @ManyToOne(() => QuestionSetEntity)
  @JoinColumn({ name: 'question_set_id' })
  questionSet: QuestionSetEntity;
}
