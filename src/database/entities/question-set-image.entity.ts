import { Column, Entity } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

export const QUESTION_SET_IMAGE_TABLE_NAME = 'question_set_images';

@Entity({ name: QUESTION_SET_IMAGE_TABLE_NAME })
export class QuestionSetImageEntity extends AbstractEntity {
  @Column()
  questionSetId: number;

  @Column()
  imageUrl: string;
}
