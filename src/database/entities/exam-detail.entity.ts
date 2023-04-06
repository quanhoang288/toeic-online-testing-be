import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { ExamEntity } from './exam.entity';
import { ExamSectionEntity } from './exam-section.entity';
import { QuestionEntity } from './question.entity';
import { QuestionSetEntity } from './question-set.entity';

export const EXAM_DETAIL_TABLE_NAME = 'exam_details';

@Entity({ name: EXAM_DETAIL_TABLE_NAME })
export class ExamDetailEntity extends AbstractEntity {
  @Column()
  examId!: number;

  @Column({ nullable: true })
  examSectionId?: number;

  @Column({ nullable: true })
  questionId?: number;

  @Column({ nullable: true })
  questionSetId?: number;

  @ManyToOne(() => ExamEntity)
  @JoinColumn({ name: 'exam_id' })
  exam: ExamEntity;

  @ManyToOne(() => ExamSectionEntity)
  @JoinColumn({ name: 'exam_section_id' })
  examSection: ExamSectionEntity;

  @ManyToOne(() => QuestionEntity)
  @JoinColumn({ name: 'question_id' })
  question: QuestionEntity;

  @ManyToOne(() => QuestionSetEntity)
  @JoinColumn({ name: 'question_set_id' })
  questionSet: QuestionSetEntity;
}
