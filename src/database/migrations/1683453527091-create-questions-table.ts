import { MigrationInterface, QueryRunner } from 'typeorm';
import { QUESTION_TABLE_NAME } from '../entities/question.entity';
import { QUESTION_SET_TABLE_NAME } from '../entities/question-set.entity';

export class createQuestionsTable1683453527091 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`${QUESTION_TABLE_NAME}\`
            (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`type\` varchar(255) NOT NULL DEFAULT 'multiple_choice',
                \`content\` text NULL,
                \`audio_key\` varchar(255) NULL,
                \`image_key\` varchar(255) NULL,
                \`explanation\` text NULL,
                \`question_set_id\` int NULL,
                \`order_in_question_set\` int NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` timestamp(6) NULL,
                PRIMARY KEY (\`id\`)
            )`,
    );

    await queryRunner.query(`
          ALTER TABLE \`${QUESTION_TABLE_NAME}\`
            ADD CONSTRAINT \`fk-${QUESTION_TABLE_NAME}-question_set_id\`
              FOREIGN KEY (\`question_set_id\`) REFERENCES \`${QUESTION_SET_TABLE_NAME}\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${QUESTION_TABLE_NAME}-question_set_id\` ON \`${QUESTION_TABLE_NAME}\``,
    );
    await queryRunner.query(`DROP TABLE \`${QUESTION_TABLE_NAME}\``);
  }
}
