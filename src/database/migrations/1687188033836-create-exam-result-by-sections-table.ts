import { MigrationInterface, QueryRunner } from 'typeorm';
import { EXAM_RESULT_BY_SECTION_TABLE_NAME } from '../entities/exam-result-by-section.entity';
import { EXAM_RESULT_TABLE_NAME } from '../entities/exam-result.entity';
import { SECTION_TABLE_NAME } from '../entities/section.entity';

export class CreateExamResultBySectionsTable1687188033836
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`${EXAM_RESULT_BY_SECTION_TABLE_NAME}\`
            (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`exam_result_id\` int NOT NULL,
                \`section_id\` int NOT NULL,
                \`num_corrects\` int NOT NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` timestamp(6) NULL,
                PRIMARY KEY (\`id\`)
            )`,
    );

    await queryRunner.query(`
            ALTER TABLE \`${EXAM_RESULT_BY_SECTION_TABLE_NAME}\`
            ADD CONSTRAINT \`fk-${EXAM_RESULT_TABLE_NAME}-exam_result_id\`
                FOREIGN KEY (\`exam_result_id\`) REFERENCES \`${EXAM_RESULT_TABLE_NAME}\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE \`${EXAM_RESULT_BY_SECTION_TABLE_NAME}\`
                ADD CONSTRAINT \`fk-${SECTION_TABLE_NAME}-section_id\`
                FOREIGN KEY (\`section_id\`) REFERENCES \`${SECTION_TABLE_NAME}\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${EXAM_RESULT_TABLE_NAME}-exam_result_id\` ON \`${EXAM_RESULT_BY_SECTION_TABLE_NAME}\``,
    );
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${SECTION_TABLE_NAME}-section_id\` ON \`${EXAM_RESULT_BY_SECTION_TABLE_NAME}\``,
    );
    await queryRunner.query(
      `DROP TABLE \`${EXAM_RESULT_BY_SECTION_TABLE_NAME}\``,
    );
  }
}
