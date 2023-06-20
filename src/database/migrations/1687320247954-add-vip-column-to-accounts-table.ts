import { MigrationInterface, QueryRunner } from 'typeorm';
import { ACCOUNT_TABLE_NAME } from '../entities/account.entity';

export class addVipColumnToAccountsTable1687320247954
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE \`${ACCOUNT_TABLE_NAME}\`
        ADD \`is_vip\` tinyint(2) NOT NULL DEFAULT 0
    `);
    await queryRunner.query(`
        ALTER TABLE \`${ACCOUNT_TABLE_NAME}\`
        ADD \`vip_plan_expires_at\` TIMESTAMP(6) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE \`${ACCOUNT_TABLE_NAME}\`
        DROP COLUMN \`is_vip\`
    `);
    await queryRunner.query(`
        ALTER TABLE \`${ACCOUNT_TABLE_NAME}\`
        DROP COLUMN \`vip_plan_expires_at\`
    `);
  }
}
