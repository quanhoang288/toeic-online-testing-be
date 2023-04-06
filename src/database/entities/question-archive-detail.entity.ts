import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { QuestionArchiveEntity } from './question-archive.entity';
import { QuestionSetEntity } from './question-set.entity';
import { QuestionEntity } from './question.entity';

export const QUESTION_ARCHIVE_DETAIL_TABLE_NAME = 'question_archive_details';

@Entity({ name: QUESTION_ARCHIVE_DETAIL_TABLE_NAME })
export class QuestionArchiveDetailEntity extends AbstractEntity {
  @Column()
  questionArchiveId!: number;

  @Column({ nullable: true })
  questionSetId?: number;

  @Column({ nullable: true })
  questionId?: number;

  @Column({ default: true })
  isEnabled: boolean;

  @ManyToOne(() => QuestionArchiveEntity)
  @JoinColumn({ name: 'question_archive_id' })
  questionArchive: QuestionArchiveEntity;

  @ManyToOne(() => QuestionSetEntity)
  @JoinColumn({ name: 'question_set_id' })
  questionSet: QuestionSetEntity;

  @ManyToOne(() => QuestionEntity)
  @JoinColumn({ name: 'question_id' })
  question: QuestionEntity;
}
