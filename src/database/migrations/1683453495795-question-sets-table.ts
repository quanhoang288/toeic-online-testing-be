import { MigrationInterface, QueryRunner } from 'typeorm';
import { QUESTION_SET_TABLE_NAME } from '../entities/question-set.entity';

export class questionSetsTable1683453495795 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`${QUESTION_SET_TABLE_NAME}\`
        (
            \`id\` int NOT NULL AUTO_INCREMENT,
            \`title\` varchar(255) NULL,
            \`content\` TEXT NULL,
            \`audio_key\` varchar(255) NULL,
            \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            \`deleted_at\` timestamp(6) NULL,
            PRIMARY KEY (\`id\`)
        )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`${QUESTION_SET_TABLE_NAME}\``);
  }
}
