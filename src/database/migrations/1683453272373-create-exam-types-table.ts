import { MigrationInterface, QueryRunner } from 'typeorm';
import { EXAM_TYPE_TABLE_NAME } from '../entities/exam-type.entity';

export class createExamTypesTable1683453272373 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`${EXAM_TYPE_TABLE_NAME}\`
            (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`reading_points\` int NULL,
                \`writing_points\` int NULL,
                \`speaking_points\` int NULL,
                \`listening_points\` int NULL,
                \`total_points\` int NOT NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` timestamp(6) NULL,
                UNIQUE INDEX \`idx-unique-${EXAM_TYPE_TABLE_NAME}-name\` (\`name\`),
                PRIMARY KEY (\`id\`)
            )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`idx-unique-${EXAM_TYPE_TABLE_NAME}-name\` ON \`${EXAM_TYPE_TABLE_NAME}\``,
    );
    await queryRunner.query(`DROP TABLE \`${EXAM_TYPE_TABLE_NAME}\``);
  }
}
