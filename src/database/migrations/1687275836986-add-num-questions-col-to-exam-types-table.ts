import { MigrationInterface, QueryRunner } from 'typeorm';
import { EXAM_TYPE_TABLE_NAME } from '../entities/exam-type.entity';

export class AddNumQuestionsColToExamTypesTable1687275836986
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE \`${EXAM_TYPE_TABLE_NAME}\`
        ADD \`num_questions\` INT NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE \`${EXAM_TYPE_TABLE_NAME}\`
        DROP COLUMN \`num_questions\`
    `);
  }
}
