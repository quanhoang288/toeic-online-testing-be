import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { ExamResultEntity } from './exam-result.entity';
import { SectionEntity } from './section.entity';
import { AnswerEntity } from './answer.entity';
import { QuestionEntity } from './question.entity';

export const EXAM_RESULT_DETAIL_TABLE_NAME = 'exam_result_details';

@Entity({ name: EXAM_RESULT_DETAIL_TABLE_NAME })
export class ExamResultDetailEntity extends AbstractEntity {
  @Column()
  examResultId: number;

  @Column({ nullable: true })
  sectionId?: number;

  @Column()
  questionId!: number;

  @Column({ nullable: true })
  inputAnswer?: string;

  @Column({ nullable: true })
  selectedAnswerId?: number;

  @Column()
  isCorrect!: boolean;

  @ManyToOne(() => ExamResultEntity)
  @JoinColumn({ name: 'exam_result_id' })
  overallResult: ExamResultEntity;

  @ManyToOne(() => SectionEntity)
  @JoinColumn({ name: 'section_id' })
  section: SectionEntity;

  @ManyToOne(() => QuestionEntity)
  @JoinColumn({ name: 'question_id' })
  question: QuestionEntity;

  @ManyToOne(() => AnswerEntity)
  @JoinColumn({ name: 'selected_answer_id' })
  selectedAnswer: AnswerEntity;
}
