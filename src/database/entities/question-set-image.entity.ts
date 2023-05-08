import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { QuestionSetEntity } from './question-set.entity';

export const QUESTION_SET_IMAGE_TABLE_NAME = 'question_set_images';

@Entity({ name: QUESTION_SET_IMAGE_TABLE_NAME })
export class QuestionSetImageEntity extends AbstractEntity {
  @Column()
  questionSetId: number;

  @Column()
  imageKey: string;

  @ManyToOne(
    () => QuestionSetEntity,
    (questionSetEntity) => questionSetEntity.images,
  )
  @JoinColumn({ name: 'question_set_id' })
  questionSet: QuestionSetEntity;
}
