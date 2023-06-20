import { MigrationInterface, QueryRunner } from 'typeorm';
import { PAYMENT_TRANSACTION_TABLE_NAME } from '../entities/payment-transaction.entity';
import { ACCOUNT_TABLE_NAME } from '../entities/account.entity';

export class createPaymentTransactionsTable1687286381854
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`${PAYMENT_TRANSACTION_TABLE_NAME}\`
                (
                    \`id\` int NOT NULL AUTO_INCREMENT,
                    \`transaction_no\` VARCHAR(255) NOT NULL,
                    \`amount\` int NOT NULL,
                    \`type\` varchar(255) NOT NULL,
                    \`status\` varchar(255) NOT NULL,
                    \`data\` text NULL,
                    \`account_id\` int NOT NULL,
                    \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                    \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                    PRIMARY KEY (\`id\`)
                ) ENGINE = InnoDB`,
    );

    await queryRunner.query(`
              ALTER TABLE \`${PAYMENT_TRANSACTION_TABLE_NAME}\`
                ADD CONSTRAINT \`fk-${PAYMENT_TRANSACTION_TABLE_NAME}-account_id\`
                  FOREIGN KEY (\`account_id\`) REFERENCES \`${ACCOUNT_TABLE_NAME}\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${PAYMENT_TRANSACTION_TABLE_NAME}-account\` ON \`${PAYMENT_TRANSACTION_TABLE_NAME}\``,
    );
    await queryRunner.query(`DROP TABLE \`${PAYMENT_TRANSACTION_TABLE_NAME}\``);
  }
}
