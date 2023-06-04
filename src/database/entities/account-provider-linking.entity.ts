import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { AccountEntity } from './account.entity';
import { OAuthProviderEntity } from './oauth-provider.entity';

export const ACCOUNT_PROVIDER_LINKING_TABLE_NAME = 'account_provider_linking';

@Entity({ name: ACCOUNT_PROVIDER_LINKING_TABLE_NAME })
@Unique('unique-idx-account-provider-linking', ['accountId', 'providerId'])
export class AccountProviderLinkingEntity extends AbstractEntity {
  @Column()
  accountId!: number;

  @Column()
  providerId!: number;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  profileUrl?: string;

  @Column({ nullable: true })
  accessToken?: string;

  @Column({ nullable: true })
  refreshToken?: string;

  @Column({ nullable: true })
  accessTokenExpiresAt?: Date;

  @Column({ nullable: true })
  refreshTokenExpiresAt?: Date;

  @ManyToOne(() => AccountEntity)
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity;

  @ManyToOne(() => OAuthProviderEntity)
  @JoinColumn({ name: 'provider_id' })
  provider: OAuthProviderEntity;
}
