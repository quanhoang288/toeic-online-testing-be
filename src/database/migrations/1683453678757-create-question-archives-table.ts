import { MigrationInterface, QueryRunner } from 'typeorm';
import { QUESTION_ARCHIVE_TABLE_NAME } from '../entities/question-archive.entity';
import { SECTION_TABLE_NAME } from '../entities/section.entity';

export class createQuestionArchivesTable1683453678757
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`${QUESTION_ARCHIVE_TABLE_NAME}\`
        (
            \`id\` int NOT NULL AUTO_INCREMENT,
            \`name\` varchar(255) NOT NULL,
            \`description\` varchar(255) NULL,
            \`section_id\` int NOT NULL,
            \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            \`deleted_at\` timestamp(6) NULL,
            UNIQUE INDEX \`idx-unique-${QUESTION_ARCHIVE_TABLE_NAME}-name\` (\`name\`),
            PRIMARY KEY (\`id\`)
        )`,
    );
    await queryRunner.query(`
        ALTER TABLE \`${QUESTION_ARCHIVE_TABLE_NAME}\`
            ADD CONSTRAINT \`fk-${QUESTION_ARCHIVE_TABLE_NAME}-section_id\`
            FOREIGN KEY (\`section_id\`) REFERENCES \`${SECTION_TABLE_NAME}\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`idx-unique-${QUESTION_ARCHIVE_TABLE_NAME}-name\` ON \`${QUESTION_ARCHIVE_TABLE_NAME}\``,
    );
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${QUESTION_ARCHIVE_TABLE_NAME}-section_id\` ON \`${QUESTION_ARCHIVE_TABLE_NAME}\``,
    );
    await queryRunner.query(`DROP TABLE \`${QUESTION_ARCHIVE_TABLE_NAME}\``);
  }
}
