import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { QuestionSetEntity } from './question-set.entity';
import { AnswerEntity } from './answer.entity';
import { QuestionArchiveEntity } from './question-archive.entity';
import { QuestionGapEntity } from './question-gap.entity';

export const QUESTION_TABLE_NAME = 'questions';

@Entity({ name: QUESTION_TABLE_NAME })
export class QuestionEntity extends AbstractEntity {
  @Column()
  type: string;

  @Column()
  text: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ nullable: true })
  questionSetId?: string;

  @Column({ nullable: true })
  explanation?: string;

  @ManyToOne(() => QuestionSetEntity, (questionSet) => questionSet.questions)
  @JoinColumn({ name: 'question_set_id' })
  questionSet: QuestionSetEntity;

  @OneToMany(() => AnswerEntity, (answer) => answer.question)
  answers: AnswerEntity[];

  @OneToMany(() => QuestionGapEntity, (gap) => gap.question)
  gaps: QuestionGapEntity[];

  @ManyToMany(() => QuestionArchiveEntity, (archive) => archive.questions)
  archives: QuestionArchiveEntity[];
}
