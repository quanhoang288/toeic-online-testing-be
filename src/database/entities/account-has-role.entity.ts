import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { RoleEntity } from './role.entity';
import { AccountEntity } from './account.entity';

export const ACCOUNT_HAS_ROLE_TABLE = 'account_has_roles';

@Entity({ name: ACCOUNT_HAS_ROLE_TABLE })
export class AccountHasRoleEntity extends AbstractEntity {
  @Column()
  roleId!: number;

  @Column()
  accountId!: number;

  @ManyToOne(() => RoleEntity)
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;

  @ManyToOne(() => AccountEntity)
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity;
}
