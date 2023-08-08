import { MigrationInterface, QueryRunner } from 'typeorm';
import { QUESTION_ARCHIVE_TABLE_NAME } from '../entities/question-archive.entity';

export class addNumParticipantsToQuestionArchives1691423011034
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`${QUESTION_ARCHIVE_TABLE_NAME}\`
            ADD \`num_participants\` INT NOT NULL DEFAULT 0
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`${QUESTION_ARCHIVE_TABLE_NAME}\`
            DROP COLUMN \`num_participants\`
        `);
  }
}
