import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { QuestionEntity } from './question.entity';

export const ANSWER_TABLE_NAME = 'answers';

@Entity({ name: ANSWER_TABLE_NAME })
export class AnswerEntity extends AbstractEntity {
  @Column()
  content!: string;

  @Column({ default: false })
  isCorrect!: boolean;

  @Column()
  questionId!: number;

  @ManyToOne(() => QuestionEntity, (question) => question.answers)
  @JoinColumn({ name: 'question_id' })
  question: QuestionEntity;
}
