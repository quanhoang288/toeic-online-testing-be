import { Column, Entity } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

export const ACCOUNT_TABLE_NAME = 'accounts';

@Entity({ name: ACCOUNT_TABLE_NAME })
export class AccountEntity extends AbstractEntity {
  @Column({ unique: true })
  email!: string;

  @Column()
  username!: string;

  @Column()
  roleId!: number;
}
