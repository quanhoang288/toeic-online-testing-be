import { MigrationInterface, QueryRunner } from 'typeorm';
import { QUESTION_SET_IMAGE_TABLE_NAME } from '../entities/question-set-image.entity';
import { QUESTION_SET_TABLE_NAME } from '../entities/question-set.entity';

export class questionSetImagesTable1683453507489 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`${QUESTION_SET_IMAGE_TABLE_NAME}\`
                (
                    \`id\` int NOT NULL AUTO_INCREMENT,
                    \`question_set_id\` int NOT NULL,
                    \`image_key\` varchar(255) NULL,
                    \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                    \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                    \`deleted_at\` timestamp(6) NULL,
                    PRIMARY KEY (\`id\`)
                )`,
    );

    await queryRunner.query(`
      ALTER TABLE \`${QUESTION_SET_IMAGE_TABLE_NAME}\`
        ADD CONSTRAINT \`fk-${QUESTION_SET_IMAGE_TABLE_NAME}-question_set_id\`
          FOREIGN KEY (\`question_set_id\`) REFERENCES \`${QUESTION_SET_TABLE_NAME}\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${QUESTION_SET_IMAGE_TABLE_NAME}-question_set_id\` ON \`${QUESTION_SET_IMAGE_TABLE_NAME}\``,
    );
    await queryRunner.query(`DROP TABLE \`${QUESTION_SET_IMAGE_TABLE_NAME}\``);
  }
}
