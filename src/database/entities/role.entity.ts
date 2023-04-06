import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { AccountEntity } from './account.entity';
import { PermissionEntity } from './permission.entity';

export const ROLE_TABLE_NAME = 'roles';

@Entity({ name: ROLE_TABLE_NAME })
export class RoleEntity extends AbstractEntity {
  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => AccountEntity, (account) => account.role)
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
