import { MigrationInterface, QueryRunner } from 'typeorm';
import { QUESTION_ARCHIVE_RESULT_DETAIL_TABLE_NAME } from '../entities/question-archive-result-detail.entity';
import { QUESTION_ARCHIVE_RESULT_TABLE_NAME } from '../entities/question-archive-result.entity';
import { QUESTION_TABLE_NAME } from '../entities/question.entity';
import { ANSWER_TABLE_NAME } from '../entities/answer.entity';

export class createQuestionArchiveResultDetailsTable1684932618036
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`${QUESTION_ARCHIVE_RESULT_DETAIL_TABLE_NAME}\`
            (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`question_archive_result_id\` int NOT NULL,
                \`question_id\` int NOT NULL,
                \`selected_answer_id\` int NULL,
                \`is_correct\` tinyint(2) NOT NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` timestamp(6) NULL,
                PRIMARY KEY (\`id\`)
            )`,
    );

    await queryRunner.query(`
            ALTER TABLE \`${QUESTION_ARCHIVE_RESULT_DETAIL_TABLE_NAME}\`
            ADD CONSTRAINT \`fk-${QUESTION_ARCHIVE_RESULT_DETAIL_TABLE_NAME}-question_archive_result_id\`
                FOREIGN KEY (\`question_archive_result_id\`) REFERENCES \`${QUESTION_ARCHIVE_RESULT_TABLE_NAME}\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE \`${QUESTION_ARCHIVE_RESULT_DETAIL_TABLE_NAME}\`
                ADD CONSTRAINT \`fk-${QUESTION_ARCHIVE_RESULT_DETAIL_TABLE_NAME}-question_id\`
                FOREIGN KEY (\`question_id\`) REFERENCES \`${QUESTION_TABLE_NAME}\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
        ALTER TABLE \`${QUESTION_ARCHIVE_RESULT_DETAIL_TABLE_NAME}\`
            ADD CONSTRAINT \`fk-${QUESTION_ARCHIVE_RESULT_DETAIL_TABLE_NAME}-selected_answer_id\`
            FOREIGN KEY (\`selected_answer_id\`) REFERENCES \`${ANSWER_TABLE_NAME}\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${QUESTION_ARCHIVE_RESULT_DETAIL_TABLE_NAME}-question_archive_result_id\` ON \`${QUESTION_ARCHIVE_RESULT_DETAIL_TABLE_NAME}\``,
    );
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${QUESTION_ARCHIVE_RESULT_DETAIL_TABLE_NAME}-question_id\` ON \`${QUESTION_ARCHIVE_RESULT_DETAIL_TABLE_NAME}\``,
    );
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${QUESTION_ARCHIVE_RESULT_DETAIL_TABLE_NAME}-selected_answer_id\` ON \`${QUESTION_ARCHIVE_RESULT_DETAIL_TABLE_NAME}\``,
    );
    await queryRunner.query(
      `DROP TABLE \`${QUESTION_ARCHIVE_RESULT_DETAIL_TABLE_NAME}\``,
    );
  }
}
