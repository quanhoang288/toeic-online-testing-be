import { Column, Entity } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

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
}
