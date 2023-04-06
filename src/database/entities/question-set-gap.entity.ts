import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { QuestionSetEntity } from './question-set.entity';

export const QUESTION_SET_GAP_TABLE_NAME = 'question_set_gaps';

@Entity({ name: QUESTION_SET_GAP_TABLE_NAME })
export class QuestionSetGapEntity extends AbstractEntity {
  @Column()
  questionSetId: number;

  @Column()
  startPos: number;

  @ManyToOne(
    () => QuestionSetEntity,
    (questionSetEntity) => questionSetEntity.gaps,
  )
  @JoinColumn({ name: 'question_set_id' })
  questionSet: QuestionSetEntity;
}
