import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { GroupChannelEntity } from './group-channel.entity';
import { ExamEntity } from './exam.entity';
import { AccountEntity } from './account.entity';
import { AccountGroupEntity } from './account-group.entity';

export const GROUP_TABLE_NAME = 'groups';

@Entity({ name: GROUP_TABLE_NAME })
export class GroupEntity extends AbstractEntity {
  @Column({ unique: true })
  name: string;

  @Column()
  isPublic: boolean;

  @Column()
  createdBy: number;

  @ManyToOne(() => AccountEntity)
  @JoinColumn({ name: 'created_by' })
  creator: AccountEntity;

  @OneToMany(() => GroupChannelEntity, (groupChannel) => groupChannel.group)
  channels: GroupChannelEntity[];

  @OneToMany(() => ExamEntity, (exam) => exam.group)
  exams: ExamEntity[];

  @OneToMany(() => AccountGroupEntity, (accGroup) => accGroup.group)
  accountGroups: AccountGroupEntity[];

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
