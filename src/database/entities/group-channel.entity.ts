import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { GroupEntity } from './group.entity';
import { ChannelPostEntity } from './channel-post.entity';

export const GROUP_CHANNEL_TABLE_NAME = 'group_channels';

@Entity({ name: GROUP_CHANNEL_TABLE_NAME })
export class GroupChannelEntity extends AbstractEntity {
  @Column()
  groupId!: number;

  @Column()
  name: string;

  @ManyToOne(() => GroupEntity, (group) => group.channels)
  group: GroupEntity;

  @OneToMany(() => ChannelPostEntity, (post) => post.channel)
  posts: ChannelPostEntity[];

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
