import { Column, Entity } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

export const QUESTION_SET_TABLE_NAME = 'question_sets';

@Entity({ name: QUESTION_SET_TABLE_NAME })
export class QuestionSetEntity extends AbstractEntity {
  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  textContext!: string;

  @Column({ nullable: true })
  audioUrl!: string;
}
