import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { QuestionArchiveResultDetailEntity } from './question-archive-result-detail.entity';
import { QuestionArchiveEntity } from './question-archive.entity';
export const QUESTION_ARCHIVE_RESULT_TABLE_NAME = 'question_archive_results';

@Entity({ name: QUESTION_ARCHIVE_RESULT_TABLE_NAME })
export class QuestionArchiveResultEntity extends AbstractEntity {
  @Column()
  questionArchiveId: number;

  @Column()
  accountId!: number;

  @Column()
  numCorrects!: number;

  @Column({ nullable: true })
  timeTakenInSecs!: number;

  @OneToMany(
    () => QuestionArchiveResultDetailEntity,
    (detail) => detail.overallResult,
  )
  detailResults: QuestionArchiveResultDetailEntity[];

  @ManyToOne(() => QuestionArchiveEntity)
  @JoinColumn({ name: 'question_archive_id' })
  questionArchive: QuestionArchiveEntity;
}
