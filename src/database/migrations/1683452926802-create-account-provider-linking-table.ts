import { MigrationInterface, QueryRunner } from 'typeorm';
import { ACCOUNT_PROVIDER_LINKING_TABLE_NAME } from '../entities/account-provider-linking.entity';
import { ACCOUNT_TABLE_NAME } from '../entities/account.entity';
import { OAUTH_PROVIDER_TABLE_NAME } from '../entities/oauth-provider.entity';

export class createAccountProviderLinkingTable1683452926802
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`${ACCOUNT_PROVIDER_LINKING_TABLE_NAME}\`
           (
             \`id\` int NOT NULL AUTO_INCREMENT,
             \`account_id\` int NOT NULL,
             \`provider_id\` int NOT NULL,
             \`access_token\` varchar(255) NULL,
             \`refresh_token\` varchar(255) NULL,
             \`access_token_expires_at\` TIMESTAMP(6) NULL,
             \`refresh_token_expires_at\` TIMESTAMP(6) NULL,
             \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
             \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
             PRIMARY KEY (\`id\`)
           )`,
    );

    await queryRunner.query(`
        ALTER TABLE \`${ACCOUNT_PROVIDER_LINKING_TABLE_NAME}\`
        ADD CONSTRAINT \`fk-${ACCOUNT_PROVIDER_LINKING_TABLE_NAME}-account_id\`
            FOREIGN KEY (\`account_id\`) REFERENCES \`${ACCOUNT_TABLE_NAME}\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `);
    await queryRunner.query(`
        ALTER TABLE \`${ACCOUNT_PROVIDER_LINKING_TABLE_NAME}\`
        ADD CONSTRAINT \`fk-${ACCOUNT_PROVIDER_LINKING_TABLE_NAME}-provider_id\`
            FOREIGN KEY (\`provider_id\`) REFERENCES \`${OAUTH_PROVIDER_TABLE_NAME}\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${ACCOUNT_PROVIDER_LINKING_TABLE_NAME}-provider_id\` ON \`${ACCOUNT_PROVIDER_LINKING_TABLE_NAME}\``,
    );
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${ACCOUNT_PROVIDER_LINKING_TABLE_NAME}-account_id\` ON \`${ACCOUNT_PROVIDER_LINKING_TABLE_NAME}\``,
    );
    await queryRunner.query(
      `DROP TABLE \`${ACCOUNT_PROVIDER_LINKING_TABLE_NAME}\``,
    );
  }
}
