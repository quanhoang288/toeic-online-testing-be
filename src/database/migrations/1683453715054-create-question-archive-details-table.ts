import { MigrationInterface, QueryRunner } from 'typeorm';
import { QUESTION_ARCHIVE_DETAIL_TABLE_NAME } from '../entities/question-archive-detail.entity';
import { QUESTION_ARCHIVE_TABLE_NAME } from '../entities/question-archive.entity';
import { QUESTION_SET_TABLE_NAME } from '../entities/question-set.entity';
import { QUESTION_TABLE_NAME } from '../entities/question.entity';

export class createQuestionArchiveDetailsTable1683453715054
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`${QUESTION_ARCHIVE_DETAIL_TABLE_NAME}\`
        (
            \`id\` int NOT NULL AUTO_INCREMENT,
            \`question_archive_id\` int NOT NULL,
            \`question_set_id\` int NULL,
            \`question_id\` int NULL,
            \`display_order\` int NOT NULL,
            \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            \`deleted_at\` timestamp(6) NULL,
            PRIMARY KEY (\`id\`)
        )`,
    );
    await queryRunner.query(`
        ALTER TABLE \`${QUESTION_ARCHIVE_DETAIL_TABLE_NAME}\`
            ADD CONSTRAINT \`fk-${QUESTION_ARCHIVE_DETAIL_TABLE_NAME}-question_archive_id\`
            FOREIGN KEY (\`question_archive_id\`) REFERENCES \`${QUESTION_ARCHIVE_TABLE_NAME}\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `);
    await queryRunner.query(`
        ALTER TABLE \`${QUESTION_ARCHIVE_DETAIL_TABLE_NAME}\`
            ADD CONSTRAINT \`fk-${QUESTION_ARCHIVE_DETAIL_TABLE_NAME}-question_set_id\`
            FOREIGN KEY (\`question_set_id\`) REFERENCES \`${QUESTION_SET_TABLE_NAME}\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
    `);
    await queryRunner.query(`
        ALTER TABLE \`${QUESTION_ARCHIVE_DETAIL_TABLE_NAME}\`
            ADD CONSTRAINT \`fk-${QUESTION_ARCHIVE_DETAIL_TABLE_NAME}-question_id\`
            FOREIGN KEY (\`question_id\`) REFERENCES \`${QUESTION_TABLE_NAME}\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${QUESTION_ARCHIVE_DETAIL_TABLE_NAME}-question_archive_id\` ON \`${QUESTION_ARCHIVE_DETAIL_TABLE_NAME}\``,
    );
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${QUESTION_ARCHIVE_DETAIL_TABLE_NAME}-question_set_id\` ON \`${QUESTION_ARCHIVE_DETAIL_TABLE_NAME}\``,
    );
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${QUESTION_ARCHIVE_DETAIL_TABLE_NAME}-question_id\` ON \`${QUESTION_ARCHIVE_DETAIL_TABLE_NAME}\``,
    );
    await queryRunner.query(
      `DROP TABLE \`${QUESTION_ARCHIVE_DETAIL_TABLE_NAME}\``,
    );
  }
}
