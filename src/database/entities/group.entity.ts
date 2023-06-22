import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { GroupChannelEntity } from './group-channel.entity';
import { ExamEntity } from './exam.entity';
import { AccountEntity } from './account.entity';

export const GROUP_TABLE_NAME = 'groups';

@Entity({ name: GROUP_TABLE_NAME })
export class GroupEntity extends AbstractEntity {
  @Column({ unique: true })
  name: string;

  @Column()
  isPublic: boolean;

  @Column({ nullable: true })
  createdBy?: number;

  @ManyToOne(() => AccountEntity)
  creator?: AccountEntity;

  @ManyToOne(() => GroupChannelEntity, (groupChannel) => groupChannel.group)
  channels: GroupChannelEntity[];

  @OneToMany(() => ExamEntity, (exam) => exam.group)
  exams: ExamEntity[];

  @ManyToMany(() => AccountEntity, (acc) => acc.groups)
  @JoinTable({
    name: 'account_group',
    joinColumn: {
      name: 'group_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'account_id',
      referencedColumnName: 'id',
    },
  })
  members: AccountEntity[];
}
