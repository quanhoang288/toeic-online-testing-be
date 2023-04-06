import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
export const PARTIAL_RESULT_TABLE_NAME = 'partial_results';

@Entity({ name: PARTIAL_RESULT_TABLE_NAME })
export class PartialResultEntity extends AbstractEntity {
  @Column({ nullable: true })
  examId?: number;

  @Column({ nullable: true })
  questionArchiveId?: number;

  @Column()
  accountId!: number;

  @Column()
  numCorrects!: number;

  @Column({ nullable: true })
  timeTakenInSecs!: number;
}
