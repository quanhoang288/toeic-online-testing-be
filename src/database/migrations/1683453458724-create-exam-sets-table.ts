import { MigrationInterface, QueryRunner } from 'typeorm';
import { EXAM_SET_TABLE_NAME } from '../entities/exam-set.entity';

export class createExamSetsTable1683453458724 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`${EXAM_SET_TABLE_NAME}\`
        (
            \`id\` int NOT NULL AUTO_INCREMENT,
            \`title\` varchar(255) NOT NULL,
            \`description\` varchar(255) NULL,
            \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            \`deleted_at\` timestamp(6) NULL,
            UNIQUE INDEX \`idx-unique-${EXAM_SET_TABLE_NAME}-title\` (\`title\`),
            PRIMARY KEY (\`id\`)
        )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`idx-unique-${EXAM_SET_TABLE_NAME}-title\` ON \`${EXAM_SET_TABLE_NAME}\``,
    );
    await queryRunner.query(`DROP TABLE \`${EXAM_SET_TABLE_NAME}\``);
  }
}
