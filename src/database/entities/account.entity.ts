import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { RoleEntity } from './role.entity';
import { OAuthProviderEntity } from './oauth-provider.entity';
import { ExamEntity } from './exam.entity';
import { QuestionArchiveEntity } from './question-archive.entity';
import { ExamResultEntity } from './exam-result.entity';
import { ExamRegistrationEntity } from './exam-registration.entity';
import { PaymentTransactionEntity } from './payment-transaction.entity';
import { GroupEntity } from './group.entity';
import { AccountHasRoleEntity } from './account-has-role.entity';
import moment from 'moment-timezone';
import { AccountGroupEntity } from './account-group.entity';

export const ACCOUNT_TABLE_NAME = 'accounts';

@Entity({ name: ACCOUNT_TABLE_NAME })
export class AccountEntity extends AbstractEntity {
  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  accessToken?: string;

  @Column({ nullable: true })
  refreshToken?: string;

  @Column({ nullable: true })
  accessTokenExpiresAt?: Date;

  @Column({ nullable: true })
  refreshTokenExpiresAt?: Date;

  @OneToMany(() => AccountGroupEntity, (accGroup) => accGroup.account)
  accountGroups: AccountGroupEntity[];

  @OneToMany(() => AccountHasRoleEntity, (accHasRole) => accHasRole.account)
  accountHasRoles: AccountHasRoleEntity[];

  @ManyToMany(() => RoleEntity, (role) => role.accounts)
  @JoinTable({
    name: 'account_has_roles',
    joinColumn: {
      name: 'account_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: RoleEntity[];

  @ManyToMany(() => OAuthProviderEntity, (provider) => provider.accounts)
  @JoinTable({
    name: 'account_provider_linking',
    joinColumn: {
      name: 'account_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'provider_id',
      referencedColumnName: 'id',
    },
  })
  providers: OAuthProviderEntity[];

  @ManyToMany(() => ExamEntity)
  @JoinTable({
    name: 'exam_results',
    joinColumn: {
      name: 'account_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'exam_id',
      referencedColumnName: 'id',
    },
  })
  examsTaken: ExamEntity[];

  @ManyToMany(
    () => QuestionArchiveEntity,
    (questionArchive) => questionArchive.accounts,
  )
  @JoinTable({
    name: 'partial_results',
    joinColumn: {
      name: 'account_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'question_archive_id',
      referencedColumnName: 'id',
    },
  })
  questionArchives: QuestionArchiveEntity[];

  @OneToMany(() => ExamResultEntity, (examResult) => examResult.account)
  examResults: ExamResultEntity[];

  @OneToMany(
    () => ExamRegistrationEntity,
    (registration) => registration.account,
  )
  examRegistrations: ExamRegistrationEntity[];

  @OneToMany(
    () => PaymentTransactionEntity,
    (paymentTransaction) => paymentTransaction.account,
  )
  paymentTransactions: PaymentTransactionEntity[];

  authProvider?: string;

  hasRole(roleId: number): boolean {
    const now = new Date();
    if (!this.accountHasRoles.length) {
      return false;
    }

    const accHasRole = this.accountHasRoles.find(
      (accHasRole) => accHasRole.roleId === roleId,
    );
    if (!accHasRole) {
      return false;
    }

    return (
      accHasRole.expiresAt && moment(now).isSameOrAfter(accHasRole.expiresAt)
    );
  }
}
