import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';

export const PARTIAL_RESULT_DETAIL_TABLE_NAME = 'partial_result_details';

@Entity({ name: PARTIAL_RESULT_DETAIL_TABLE_NAME })
export class PartialResultDetailEntity extends AbstractEntity {
  @Column()
  partialResultId!: number;

  @Column({ nullable: true })
  examSectionId?: number;

  @Column()
  questionId!: number;

  @Column({ nullable: true })
  selectedAnswerId?: number;

  @Column({ nullable: true })
  isCorrect!: boolean;
}
