import { Column, Entity } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

export const QUESTION_ARCHIVE_TABLE_NAME = 'question_archives';

@Entity({ name: QUESTION_ARCHIVE_TABLE_NAME })
export class QuestionArchiveEntity extends AbstractEntity {
  @Column({ unique: true })
  name: string;

  @Column()
  type: string;
}
