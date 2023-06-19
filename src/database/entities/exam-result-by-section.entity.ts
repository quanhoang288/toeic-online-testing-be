import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { SectionEntity } from './section.entity';
import { ExamResultEntity } from './exam-result.entity';

export const EXAM_RESULT_BY_SECTION_TABLE_NAME = 'exam_result_by_sections';

@Entity({ name: EXAM_RESULT_BY_SECTION_TABLE_NAME })
export class ExamResultBySectionEntity extends AbstractEntity {
  @Column()
  examResultId!: number;

  @Column()
  sectionId!: number;

  @Column()
  numCorrects!: number;

  @ManyToOne(() => SectionEntity)
  @JoinColumn({ name: 'section_id' })
  section: SectionEntity;

  @ManyToOne(() => ExamResultEntity)
  @JoinColumn({ name: 'exam_result_id' })
  examResult: ExamResultEntity;
}
