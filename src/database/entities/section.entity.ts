import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { ExamTypeEntity } from './exam-type.entity';
import { QuestionArchiveEntity } from './question-archive.entity';

export const SECTION_TABLE_NAME = 'sections';

@Entity({ name: SECTION_TABLE_NAME })
export class SectionEntity extends AbstractEntity {
  @Column()
  examTypeId: number;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  numQuestions!: number;

  @ManyToOne(() => ExamTypeEntity, (examType) => examType.sections)
  examType: ExamTypeEntity;

  @OneToMany(
    () => QuestionArchiveEntity,
    (questionArchive) => questionArchive.section,
  )
  questionArchives: QuestionArchiveEntity[];
}
