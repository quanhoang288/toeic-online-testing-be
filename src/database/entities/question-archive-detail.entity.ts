import { Column, Entity } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

export const QUESTION_ARCHIVE_DETAIL_TABLE_NAME = 'question_archive_details';

@Entity({ name: QUESTION_ARCHIVE_DETAIL_TABLE_NAME })
export class QuestionArchiveDetailEntity extends AbstractEntity {
  @Column()
  questionArchiveId: number;

  @Column({ nullable: true })
  questionSetId: number;

  @Column({ nullable: true })
  questionId: number;

  @Column({ default: true })
  isEnabled: boolean;
}
