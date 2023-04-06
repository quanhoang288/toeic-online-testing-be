import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { QuestionSetEntity } from './question-set.entity';
import { QuestionEntity } from './question.entity';
import { AccountEntity } from './account.entity';

export const QUESTION_ARCHIVE_TABLE_NAME = 'question_archives';

@Entity({ name: QUESTION_ARCHIVE_TABLE_NAME })
export class QuestionArchiveEntity extends AbstractEntity {
  @Column({ unique: true })
  name: string;

  @Column()
  type: string;

  @ManyToMany(() => QuestionSetEntity, (questionSet) => questionSet.archives)
  @JoinTable({
    name: 'question_archive_details',
    joinColumn: {
      name: 'question_archive_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'question_set_id',
      referencedColumnName: 'id',
    },
  })
  questionSets: QuestionSetEntity[];

  @ManyToMany(() => QuestionEntity, (question) => question.archives)
  @JoinTable({
    name: 'question_archive_details',
    joinColumn: {
      name: 'question_archive_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'question_id',
      referencedColumnName: 'id',
    },
  })
  questions: QuestionEntity[];

  @ManyToMany(() => AccountEntity, (account) => account.questionArchives)
  accounts: AccountEntity[];
}
