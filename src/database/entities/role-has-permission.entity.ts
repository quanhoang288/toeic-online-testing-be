import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { RoleEntity } from './role.entity';
import { PermissionEntity } from './permission.entity';

export const ROLE_HAS_PERMISSION_TABLE = 'role_has_permissions';

@Entity({ name: ROLE_HAS_PERMISSION_TABLE })
export class RoleHasPermissionEntity extends AbstractEntity {
  @Column()
  roleId!: number;

  @Column()
  permissionId!: number;

  @ManyToOne(() => RoleEntity)
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;

  @ManyToOne(() => PermissionEntity)
  @JoinColumn({ name: 'permission_id' })
  permission: PermissionEntity;
}
