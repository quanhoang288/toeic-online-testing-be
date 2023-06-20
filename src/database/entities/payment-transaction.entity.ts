import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { AccountEntity } from './account.entity';

export const PAYMENT_TRANSACTION_TABLE_NAME = 'payment_transactions';

@Entity({ name: PAYMENT_TRANSACTION_TABLE_NAME })
export class PaymentTransactionEntity extends AbstractEntity {
  @Column()
  transactionNo!: string;

  @Column()
  accountId!: number;

  @Column()
  amount!: number;

  @Column()
  type!: string;

  @Column()
  status!: string;

  @Column()
  @Column({ nullable: true })
  data?: string;

  @ManyToOne(() => AccountEntity, (acc) => acc.paymentTransactions)
  account: AccountEntity;
}
