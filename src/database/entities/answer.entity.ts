import { Column, Entity } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

export const ANSWER_TABLE_NAME = 'answers';

@Entity({ name: ANSWER_TABLE_NAME })
export class AnswerEntity extends AbstractEntity {
  @Column()
  type!: string;

  @Column()
  text!: string;

  @Column({ default: false })
  is_correct!: boolean;
}
