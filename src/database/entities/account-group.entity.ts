import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { GroupEntity } from './group.entity';
import { AccountEntity } from './account.entity';

export const ACCOUNT_GROUP_TABLE_NAME = 'account_group';

@Entity({ name: ACCOUNT_GROUP_TABLE_NAME })
export class AccountGroupEntity extends AbstractEntity {
  @Column()
  accountId!: number;

  @Column()
  groupId!: number;

  @Column()
  isAdmin!: boolean;

  @ManyToOne(() => GroupEntity)
  group: GroupEntity;

  @ManyToOne(() => AccountEntity)
  account: AccountEntity;
}
