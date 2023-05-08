import { MigrationInterface, QueryRunner } from 'typeorm';
import { ANSWER_TABLE_NAME } from '../entities/answer.entity';
import { QUESTION_TABLE_NAME } from '../entities/question.entity';

export class createAnswersTable1683453534928 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`${ANSWER_TABLE_NAME}\`
        (
            \`id\` int NOT NULL AUTO_INCREMENT,
            \`type\` varchar(255) NOT NULL DEFAULT '',
            \`content\` varchar(255) NOT NULL,
            \`is_correct\` tinyint(2) NOT NULL DEFAULT 0,
            \`question_id\` int NOT NULL,
            \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            \`deleted_at\` timestamp(6) NULL,
            PRIMARY KEY (\`id\`)
        )`,
    );

    await queryRunner.query(`
        ALTER TABLE \`${ANSWER_TABLE_NAME}\`
        ADD CONSTRAINT \`fk-${ANSWER_TABLE_NAME}-question_id\`
            FOREIGN KEY (\`question_id\`) REFERENCES \`${QUESTION_TABLE_NAME}\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${ANSWER_TABLE_NAME}-question_id\` ON \`${ANSWER_TABLE_NAME}\``,
    );
    await queryRunner.query(`DROP TABLE \`${ANSWER_TABLE_NAME}\``);
  }
}
