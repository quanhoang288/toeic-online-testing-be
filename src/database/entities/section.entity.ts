import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';

export const SECTION_TABLE_NAME = 'sections';

@Entity({ name: SECTION_TABLE_NAME })
export class SectionEntity extends AbstractEntity {
  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  numQuestions!: number;
}
