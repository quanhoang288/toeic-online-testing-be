import { Column, DeleteDateColumn, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { SectionEntity } from './section.entity';

export const EXAM_TYPE_TABLE_NAME = 'exam_types';

@Entity({ name: EXAM_TYPE_TABLE_NAME })
export class ExamTypeEntity extends AbstractEntity {
  @Column({ unique: true })
  name!: string;

  @Column()
  numQuestions!: number;

  @Column({ nullable: true })
  readingPoints?: number;

  @Column({ nullable: true })
  writingPoints?: number;

  @Column({ nullable: true })
  speakingPoints?: number;

  @Column({ nullable: true })
  listeningPoints?: number;

  @Column({ nullable: true })
  totalPoints!: number;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @OneToMany(() => SectionEntity, (section) => section.examType)
  sections: SectionEntity[];
}
