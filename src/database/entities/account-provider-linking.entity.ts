import { Column, Entity, Unique } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

export const ACCOUNT_PROVIDER_LINKING_TABLE_NAME = 'account_provider_linking';

@Entity({ name: ACCOUNT_PROVIDER_LINKING_TABLE_NAME })
@Unique('unique-idx-account-provider-linking', ['accountId', 'providerId'])
export class AccountProviderLinkingEntity extends AbstractEntity {
  @Column()
  accountId!: number;

  @Column()
  providerId!: number;

  @Column({ nullable: true })
  accessToken?: string;

  @Column({ nullable: true })
  refreshToken?: string;

  @Column({ nullable: true })
  accessTokenExpiresAt?: Date;

  @Column({ nullable: true })
  refreshTokenExpiresAt?: Date;
}
