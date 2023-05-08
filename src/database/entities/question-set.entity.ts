import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { QuestionEntity } from './question.entity';
import { QuestionSetImageEntity } from './question-set-image.entity';
import { QuestionArchiveEntity } from './question-archive.entity';
import { ExamDetailEntity } from './exam-detail.entity';

export const QUESTION_SET_TABLE_NAME = 'question_sets';

@Entity({ name: QUESTION_SET_TABLE_NAME })
export class QuestionSetEntity extends AbstractEntity {
  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  content?: string;

  @Column({ nullable: true })
  audioKey?: string;

  @OneToMany(() => QuestionEntity, (question) => question.questionSet)
  questions: QuestionEntity[];

  @OneToMany(() => QuestionEntity, (image) => image.questionSet)
  images: QuestionSetImageEntity[];

  @ManyToMany(() => QuestionArchiveEntity, (archive) => archive.questionSets)
  archives: QuestionArchiveEntity[];

  @OneToMany(() => ExamDetailEntity, (examDetail) => examDetail.questionSet)
  examDetails: ExamDetailEntity[];
}
