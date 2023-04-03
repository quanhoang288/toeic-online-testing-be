import { Column, Entity } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

export const ROLE_TABLE_NAME = 'roles';

@Entity({ name: ROLE_TABLE_NAME })
export class RoleEntity extends AbstractEntity {
  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description?: string;
}
