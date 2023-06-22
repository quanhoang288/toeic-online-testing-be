import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { GroupEntity } from './group.entity';

export const GROUP_CHANNEL_TABLE_NAME = 'group_channels';

@Entity({ name: GROUP_CHANNEL_TABLE_NAME })
export class GroupChannelEntity extends AbstractEntity {
  @Column()
  groupId!: number;

  @Column()
  name: string;

  @ManyToOne(() => GroupEntity, (group) => group.channels)
  group: GroupEntity;
}
