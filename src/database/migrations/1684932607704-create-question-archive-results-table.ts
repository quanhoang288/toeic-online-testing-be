import { MigrationInterface, QueryRunner } from 'typeorm';
import { QUESTION_ARCHIVE_RESULT_TABLE_NAME } from '../entities/question-archive-result.entity';
import { QUESTION_ARCHIVE_TABLE_NAME } from '../entities/question-archive.entity';
import { ACCOUNT_TABLE_NAME } from '../entities/account.entity';

export class createQuestionArchiveResultsTable1684932607704
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`${QUESTION_ARCHIVE_RESULT_TABLE_NAME}\`
                (
                    \`id\` int NOT NULL AUTO_INCREMENT,
                    \`question_archive_id\` int NOT NULL,
                    \`account_id\` int NOT NULL,
                    \`num_corrects\` int NULL,
                    \`time_taken_in_secs\` int NOT NULL,
                    \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                    \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                    \`deleted_at\` timestamp(6) NULL,
                    PRIMARY KEY (\`id\`)
                )`,
    );

    await queryRunner.query(`
            ALTER TABLE \`${QUESTION_ARCHIVE_RESULT_TABLE_NAME}\`
            ADD CONSTRAINT \`fk-${QUESTION_ARCHIVE_RESULT_TABLE_NAME}-question_archive_id\`
                FOREIGN KEY (\`question_archive_id\`) REFERENCES \`${QUESTION_ARCHIVE_TABLE_NAME}\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE \`${QUESTION_ARCHIVE_RESULT_TABLE_NAME}\`
                ADD CONSTRAINT \`fk-${QUESTION_ARCHIVE_RESULT_TABLE_NAME}-account_id\`
                FOREIGN KEY (\`account_id\`) REFERENCES \`${ACCOUNT_TABLE_NAME}\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${QUESTION_ARCHIVE_RESULT_TABLE_NAME}-question_archive_id\` ON \`${QUESTION_ARCHIVE_RESULT_TABLE_NAME}\``,
    );
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${QUESTION_ARCHIVE_RESULT_TABLE_NAME}-account_id\` ON \`${QUESTION_ARCHIVE_RESULT_TABLE_NAME}\``,
    );
    await queryRunner.query(
      `DROP TABLE \`${QUESTION_ARCHIVE_RESULT_TABLE_NAME}\``,
    );
  }
}
