import { MigrationInterface, QueryRunner } from 'typeorm';
import { ACCOUNT_HAS_ROLE_TABLE } from '../entities/account-has-role.entity';

export class createAccountHasRolesTable1685865645130
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`${ACCOUNT_HAS_ROLE_TABLE}\`
            (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`role_id\` int NOT NULL,
                \`account_id\` int NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB`,
    );

    await queryRunner.query(`
          ALTER TABLE \`${ACCOUNT_HAS_ROLE_TABLE}\`
            ADD CONSTRAINT \`fk-${ACCOUNT_HAS_ROLE_TABLE}-role_id\`
              FOREIGN KEY (\`role_id\`) REFERENCES \`roles\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
          ALTER TABLE \`${ACCOUNT_HAS_ROLE_TABLE}\`
            ADD CONSTRAINT \`fk-${ACCOUNT_HAS_ROLE_TABLE}-account_id\`
              FOREIGN KEY (\`account_id\`) REFERENCES \`accounts\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${ACCOUNT_HAS_ROLE_TABLE}-role_id\` ON \`${ACCOUNT_HAS_ROLE_TABLE}\``,
    );
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${ACCOUNT_HAS_ROLE_TABLE}-account_id\` ON \`${ACCOUNT_HAS_ROLE_TABLE}\``,
    );
    await queryRunner.query(`DROP TABLE \`${ACCOUNT_HAS_ROLE_TABLE}\``);
  }
}
