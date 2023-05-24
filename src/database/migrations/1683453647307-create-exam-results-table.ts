import { MigrationInterface, QueryRunner } from 'typeorm';
import { EXAM_RESULT_TABLE_NAME } from '../entities/exam-result.entity';
import { EXAM_TABLE_NAME } from '../entities/exam.entity';
import { ACCOUNT_TABLE_NAME } from '../entities/account.entity';

export class createExamResultsTable1683453647307 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`${EXAM_RESULT_TABLE_NAME}\`
            (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`exam_id\` int NOT NULL,
                \`account_id\` int NOT NULL,
                \`is_virtual\` tinyint(2) NOT NULL DEFAULT 0,
                \`is_partial\` tinyint(2) NOT NULL DEFAULT 0,
                \`num_corrects\` int NULL,
                \`time_taken_in_secs\` int NOT NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` timestamp(6) NULL,
                PRIMARY KEY (\`id\`)
            )`,
    );

    await queryRunner.query(`
        ALTER TABLE \`${EXAM_RESULT_TABLE_NAME}\`
        ADD CONSTRAINT \`fk-${EXAM_RESULT_TABLE_NAME}-exam_id\`
            FOREIGN KEY (\`exam_id\`) REFERENCES \`${EXAM_TABLE_NAME}\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `);
    await queryRunner.query(`
        ALTER TABLE \`${EXAM_RESULT_TABLE_NAME}\`
            ADD CONSTRAINT \`fk-${EXAM_RESULT_TABLE_NAME}-account_id\`
            FOREIGN KEY (\`account_id\`) REFERENCES \`${ACCOUNT_TABLE_NAME}\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${EXAM_RESULT_TABLE_NAME}-exam_id\` ON \`${EXAM_RESULT_TABLE_NAME}\``,
    );
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${EXAM_RESULT_TABLE_NAME}-account_id\` ON \`${EXAM_RESULT_TABLE_NAME}\``,
    );
    await queryRunner.query(`DROP TABLE \`${EXAM_RESULT_TABLE_NAME}\``);
  }
}
