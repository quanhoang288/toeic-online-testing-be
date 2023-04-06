import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { ExamEntity } from './exam.entity';
import { SectionEntity } from './section.entity';

export const EXAM_SECTION_TABLE_NAME = 'exam_sections';

@Entity({ name: EXAM_SECTION_TABLE_NAME })
export class ExamSectionEntity extends AbstractEntity {
  @Column()
  examId!: number;

  @Column()
  sectionId!: number;

  @Column()
  sectionName!: string;

  @ManyToOne(() => ExamEntity, (exam) => exam.examSections)
  @JoinColumn({ name: 'exam_id' })
  exam: ExamEntity;

  @ManyToOne(() => SectionEntity)
  @JoinColumn({ name: 'section' })
  section: SectionEntity;
}
