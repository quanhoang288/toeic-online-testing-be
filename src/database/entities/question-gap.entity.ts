import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { QuestionEntity } from './question.entity';

export const QUESTION_GAP_TABLE_NAME = 'question_gaps';

@Entity({ name: QUESTION_GAP_TABLE_NAME })
export class QuestionGapEntity extends AbstractEntity {
  @Column()
  questionId: number;

  @Column()
  startPos: number;

  @ManyToOne(() => QuestionEntity, (questionEntity) => questionEntity.gaps)
  @JoinColumn({ name: 'question_id' })
  question: QuestionEntity;
}
