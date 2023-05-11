import { Column, Entity, ManyToMany } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { RoleEntity } from './role.entity';

export const PERMISSION_TABLE_NAME = 'permissions';

@Entity({ name: PERMISSION_TABLE_NAME })
export class PermissionEntity extends AbstractEntity {
  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => RoleEntity, (role) => role.permissions)
  roles: RoleEntity[];
}
