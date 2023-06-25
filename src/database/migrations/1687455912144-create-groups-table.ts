import { MigrationInterface, QueryRunner } from 'typeorm';
import { GROUP_TABLE_NAME } from '../entities/group.entity';
import { ACCOUNT_TABLE_NAME } from '../entities/account.entity';

export class createGroupsTable1687455912144 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`${GROUP_TABLE_NAME}\`
            (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`is_public\` tinyint(2) NOT NULL DEFAULT 1,
                \`created_by\` int NOT NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` timestamp(6) NULL,
                PRIMARY KEY (\`id\`)
            )`,
    );
    await queryRunner.query(`
    ALTER TABLE \`${GROUP_TABLE_NAME}\`
      ADD CONSTRAINT \`fk-${GROUP_TABLE_NAME}-created_by\`
        FOREIGN KEY (\`created_by\`) REFERENCES \`${ACCOUNT_TABLE_NAME}\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${GROUP_TABLE_NAME}-created_by\` ON \`${GROUP_TABLE_NAME}\``,
    );
    await queryRunner.query(`DROP TABLE \`${GROUP_TABLE_NAME}\``);
  }
}
