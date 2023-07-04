import { MigrationInterface, QueryRunner } from 'typeorm';
import { EXAM_TABLE_NAME } from '../entities/exam.entity';
import { GROUP_TABLE_NAME } from '../entities/group.entity';

export class addColsToExamTable1687593666371 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE \`${EXAM_TABLE_NAME}\`
        ADD \`group_id\` INT NULL
    `);
    await queryRunner.query(`
        ALTER TABLE \`${EXAM_TABLE_NAME}\`
        ADD \`access_scope\` varchar(255) NOT NULL DEFAULT 'public'
    `);
    await queryRunner.query(`
      ALTER TABLE \`${EXAM_TABLE_NAME}\`
        ADD CONSTRAINT \`fk-${EXAM_TABLE_NAME}-group_id\`
          FOREIGN KEY (\`group_id\`) REFERENCES \`${GROUP_TABLE_NAME}\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${EXAM_TABLE_NAME}-group_id\` ON \`${EXAM_TABLE_NAME}\``,
    );
    await queryRunner.query(`
        ALTER TABLE \`${EXAM_TABLE_NAME}\`
        DROP COLUMN \`group_id\`
    `);
    await queryRunner.query(`
        ALTER TABLE \`${EXAM_TABLE_NAME}\`
        DROP COLUMN \`access_scope\`
    `);
  }
}
