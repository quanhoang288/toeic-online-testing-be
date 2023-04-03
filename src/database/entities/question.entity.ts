import { Column, Entity } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

export const QUESTION_TABLE_NAME = 'questions';

@Entity({ name: QUESTION_TABLE_NAME })
export class QuestionEntity extends AbstractEntity {
  @Column()
  type: string;

  @Column()
  text: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  questionSetId: string;

  @Column({ nullable: true })
  explanation: string;
}
