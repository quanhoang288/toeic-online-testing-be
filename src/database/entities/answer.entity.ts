import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { QuestionEntity } from './question.entity';

export const ANSWER_TABLE_NAME = 'answers';

@Entity({ name: ANSWER_TABLE_NAME })
export class AnswerEntity extends AbstractEntity {
  @Column()
  type!: string;

  @Column()
  text!: string;

  @Column({ default: false })
  isCorrect!: boolean;

  @ManyToOne(() => QuestionEntity, (question) => question.answers)
  @JoinColumn({ name: 'question_id' })
  question: QuestionEntity;
}
