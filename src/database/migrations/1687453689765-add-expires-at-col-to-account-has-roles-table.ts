import { MigrationInterface, QueryRunner } from 'typeorm';
import { ACCOUNT_HAS_ROLE_TABLE } from '../entities/account-has-role.entity';

export class addExpiresAtColToAccountHasRolesTable1687453689765
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE \`${ACCOUNT_HAS_ROLE_TABLE}\`
        ADD \`expires_at\` TIMESTAMP(6) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE \`${ACCOUNT_HAS_ROLE_TABLE}\`
        DROP COLUMN \`expires_at\`
    `);
  }
}
