import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { AccountEntity } from './account.entity';
import { PermissionEntity } from './permission.entity';

export const ROLE_TABLE_NAME = 'roles';

@Entity({ name: ROLE_TABLE_NAME })
export class RoleEntity extends AbstractEntity {
  @Column({ unique: true })
  name!: string;

  @Column({ type: 'tinyint', default: 0 })
  isAdmin!: boolean;

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => AccountEntity, (account) => account.roles)
  accounts: AccountEntity[];

  @ManyToMany(() => PermissionEntity, (permission) => permission.roles)
  @JoinTable({
    name: 'role_has_permissions',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: PermissionEntity[];
}
