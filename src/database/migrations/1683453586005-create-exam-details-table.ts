import { MigrationInterface, QueryRunner } from 'typeorm';
import { EXAM_DETAIL_TABLE_NAME } from '../entities/exam-detail.entity';
import { EXAM_TABLE_NAME } from '../entities/exam.entity';
import { SECTION_TABLE_NAME } from '../entities/section.entity';
import { QUESTION_TABLE_NAME } from '../entities/question.entity';
import { QUESTION_SET_TABLE_NAME } from '../entities/question-set.entity';

export class createExamDetailsTable1683453586005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`${EXAM_DETAIL_TABLE_NAME}\`
        (
            \`id\` int NOT NULL AUTO_INCREMENT,
            \`exam_id\` int NOT NULL,
            \`section_id\` int NULL,
            \`question_id\` int NULL,
            \`question_set_id\` int NULL,
            \`display_order\` int NOT NULL,
            \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            \`deleted_at\` timestamp(6) NULL,
            PRIMARY KEY (\`id\`)
        )`,
    );

    await queryRunner.query(`
        ALTER TABLE \`${EXAM_DETAIL_TABLE_NAME}\`
        ADD CONSTRAINT \`fk-${EXAM_DETAIL_TABLE_NAME}-exam_id\`
            FOREIGN KEY (\`exam_id\`) REFERENCES \`${EXAM_TABLE_NAME}\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `);
    await queryRunner.query(`
        ALTER TABLE \`${EXAM_DETAIL_TABLE_NAME}\`
            ADD CONSTRAINT \`fk-${EXAM_DETAIL_TABLE_NAME}-section_id\`
            FOREIGN KEY (\`section_id\`) REFERENCES \`${SECTION_TABLE_NAME}\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
    `);
    await queryRunner.query(`
        ALTER TABLE \`${EXAM_DETAIL_TABLE_NAME}\`
            ADD CONSTRAINT \`fk-${EXAM_DETAIL_TABLE_NAME}-question_id\`
            FOREIGN KEY (\`question_id\`) REFERENCES \`${QUESTION_TABLE_NAME}\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
    `);
    await queryRunner.query(`
        ALTER TABLE \`${EXAM_DETAIL_TABLE_NAME}\`
            ADD CONSTRAINT \`fk-${EXAM_DETAIL_TABLE_NAME}-question_set_id\`
            FOREIGN KEY (\`question_set_id\`) REFERENCES \`${QUESTION_SET_TABLE_NAME}\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${EXAM_DETAIL_TABLE_NAME}-exam_id\` ON \`${EXAM_DETAIL_TABLE_NAME}\``,
    );
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${EXAM_DETAIL_TABLE_NAME}-section_id\` ON \`${EXAM_DETAIL_TABLE_NAME}\``,
    );
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${EXAM_DETAIL_TABLE_NAME}-question_id\` ON \`${EXAM_DETAIL_TABLE_NAME}\``,
    );
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${EXAM_DETAIL_TABLE_NAME}-question_set_id\` ON \`${EXAM_DETAIL_TABLE_NAME}\``,
    );
    await queryRunner.query(`DROP TABLE \`${EXAM_DETAIL_TABLE_NAME}\``);
  }
}
