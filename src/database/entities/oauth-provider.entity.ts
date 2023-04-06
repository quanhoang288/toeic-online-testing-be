import { Column, Entity, ManyToMany } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { AccountEntity } from './account.entity';

export const OAUTH_PROVIDER_TABLE_NAME = 'oauth_providers';

@Entity({ name: OAUTH_PROVIDER_TABLE_NAME })
export class OAuthProviderEntity extends AbstractEntity {
  @Column()
  name!: string;

  @Column({ nullable: true })
  clientId?: string;

  @Column({ nullable: true })
  clientSecret?: string;

  @Column()
  tokenUrl!: string;

  @Column()
  redirectUrl!: string;

  @Column()
  userInfoUrl!: string;

  @ManyToMany(() => AccountEntity, (account) => account.providers)
  accounts: AccountEntity[];
}
