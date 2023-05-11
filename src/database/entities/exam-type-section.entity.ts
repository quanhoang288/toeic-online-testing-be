import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { ExamTypeEntity } from './exam-type.entity';
import { SectionEntity } from './section.entity';

export const EXAM_TYPE_SECTION_TABLE_NAME = 'exam_type_sections';

@Entity({ name: EXAM_TYPE_SECTION_TABLE_NAME })
export class ExamTypeSectionEntity extends AbstractEntity {
  @Column()
  examTypeId!: number;

  @Column()
  sectionId!: number;

  @Column()
  sectionName!: string;

  @Column()
  displayOrder!: number;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => ExamTypeEntity)
  @JoinColumn({ name: 'exam_type_id' })
  examType: ExamTypeEntity;

  @ManyToOne(() => SectionEntity)
  @JoinColumn({ name: 'section_id' })
  section: SectionEntity;
}
