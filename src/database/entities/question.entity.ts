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
import { ExamDetailEntity } from './exam-detail.entity';

export const QUESTION_TABLE_NAME = 'questions';

@Entity({ name: QUESTION_TABLE_NAME })
export class QuestionEntity extends AbstractEntity {
  @Column()
  type: string;

  @Column({ nullable: true })
  content?: string;

  @Column({ nullable: true })
  audioKey?: string;

  @Column({ nullable: true })
  imageKey?: string;

  @Column({ nullable: true })
  questionSetId?: number;

  @Column({ nullable: true })
  orderInQuestionSet?: number;

  @Column({ nullable: true })
  explanation?: string;

  @ManyToOne(() => QuestionSetEntity, (questionSet) => questionSet.questions)
  @JoinColumn({ name: 'question_set_id' })
  questionSet: QuestionSetEntity;

  @OneToMany(() => AnswerEntity, (answer) => answer.question)
  answers: AnswerEntity[];

  @ManyToMany(() => QuestionArchiveEntity, (archive) => archive.questions)
  archives: QuestionArchiveEntity[];

  @OneToMany(() => ExamDetailEntity, (examDetail) => examDetail.question)
  examDetails: ExamDetailEntity[];
}
