import { MigrationInterface, QueryRunner } from 'typeorm';
import { ACCOUNT_GROUP_TABLE_NAME } from '../entities/account-group.entity';
import { GROUP_TABLE_NAME } from '../entities/group.entity';
import { ACCOUNT_TABLE_NAME } from '../entities/account.entity';

export class createAccountGroupTable1687455931485
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`${ACCOUNT_GROUP_TABLE_NAME}\`
                    (
                        \`id\` int NOT NULL AUTO_INCREMENT,
                        \`account_id\` int NOT NULL,
                        \`group_id\` int NOT NULL,
                        \`is_admin\` tinyint(2) NOT NULL DEFAULT 0,
                        \`request_to_join_status\` varchar(255) NOT NULL,
                        \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                        \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                        PRIMARY KEY (\`id\`)
                    )`,
    );
    await queryRunner.query(`
        ALTER TABLE \`${ACCOUNT_GROUP_TABLE_NAME}\`
          ADD CONSTRAINT \`fk-${ACCOUNT_GROUP_TABLE_NAME}-account_id\`
            FOREIGN KEY (\`account_id\`) REFERENCES \`${ACCOUNT_TABLE_NAME}\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      `);

    await queryRunner.query(`
        ALTER TABLE \`${ACCOUNT_GROUP_TABLE_NAME}\`
          ADD CONSTRAINT \`fk-${ACCOUNT_GROUP_TABLE_NAME}-group_id\`
            FOREIGN KEY (\`group_id\`) REFERENCES \`${GROUP_TABLE_NAME}\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${ACCOUNT_GROUP_TABLE_NAME}-group_id\` ON \`${ACCOUNT_GROUP_TABLE_NAME}\``,
    );
    await queryRunner.query(`DROP TABLE \`${ACCOUNT_GROUP_TABLE_NAME}\``);
  }
}
