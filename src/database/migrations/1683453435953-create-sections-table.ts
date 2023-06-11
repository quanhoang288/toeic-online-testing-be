import { MigrationInterface, QueryRunner } from 'typeorm';
import { SECTION_TABLE_NAME } from '../entities/section.entity';
import { EXAM_TYPE_TABLE_NAME } from '../entities/exam-type.entity';

export class createSectionsTable1683453435953 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`${SECTION_TABLE_NAME}\`
                (
                    \`id\` int NOT NULL AUTO_INCREMENT,
                    \`name\` varchar(255) NOT NULL,
                    \`type\` varchar(255) NOT NULL,
                    \`description\` varchar(255) NULL,
                    \`num_questions\` int NOT NULL,
                    \`exam_type_id\` int NOT NULL,
                    \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                    \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                    \`deleted_at\` timestamp(6) NULL,
                    PRIMARY KEY (\`id\`)
                )`,
    );

    await queryRunner.query(`
      ALTER TABLE \`${SECTION_TABLE_NAME}\`
        ADD CONSTRAINT \`fk-${SECTION_TABLE_NAME}-exam_type_id\`
          FOREIGN KEY (\`exam_type_id\`) REFERENCES \`${EXAM_TYPE_TABLE_NAME}\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`${SECTION_TABLE_NAME}\``);
  }
}
