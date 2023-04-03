import { Column, Entity } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

export const PERMISSION_TABLE_NAME = 'permissions';

@Entity({ name: PERMISSION_TABLE_NAME })
export class PermissionEntity extends AbstractEntity {
  @Column()
  name!: string;

  @Column({ nullable: true })
  description: string;
}
