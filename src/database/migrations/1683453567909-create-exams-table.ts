import { MigrationInterface, QueryRunner } from 'typeorm';
import { EXAM_TABLE_NAME } from '../entities/exam.entity';
import { EXAM_SET_TABLE_NAME } from '../entities/exam-set.entity';
import { EXAM_TYPE_TABLE_NAME } from '../entities/exam-type.entity';

export class createExamsTable1683453567909 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`${EXAM_TABLE_NAME}\`
        (
            \`id\` int NOT NULL AUTO_INCREMENT,
            \`name\` varchar(255) NOT NULL,
            \`exam_type_id\` int NOT NULL,
            \`has_multiple_sections\` tinyint(2) NOT NULL default 1,
            \`time_limit_in_mins\` int NULL,
            \`exam_set_id\` int NULL,
            \`register_starts_at\` timestamp(6) NULL,
            \`register_ends_at\` timestamp(6) NULL,
            \`starts_at\` timestamp(6) NULL,
            \`is_mini_test\` tinyint(2) NOT NULL DEFAULT 0,
            \`num_participants\` int NOT NULL DEFAULT 0,
            \`audio_key\` varchar(255) NULL,
            \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            \`deleted_at\` timestamp(6) NULL,
            UNIQUE INDEX \`idx-unique-${EXAM_TABLE_NAME}-name\` (\`name\`),
            PRIMARY KEY (\`id\`)
        )`,
    );

    await queryRunner.query(`
        ALTER TABLE \`${EXAM_TABLE_NAME}\`
        ADD CONSTRAINT \`fk-${EXAM_TABLE_NAME}-exam_set_id\`
            FOREIGN KEY (\`exam_set_id\`) REFERENCES \`${EXAM_SET_TABLE_NAME}\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
    `);
    await queryRunner.query(`
    ALTER TABLE \`${EXAM_TABLE_NAME}\`
        ADD CONSTRAINT \`fk-${EXAM_TABLE_NAME}-exam_type_id\`
        FOREIGN KEY (\`exam_type_id\`) REFERENCES \`${EXAM_TYPE_TABLE_NAME}\` (\`id\`) ON DELETE NO ACTION ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`idx-unique-${EXAM_TABLE_NAME}-name\` ON \`${EXAM_TABLE_NAME}\``,
    );
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${EXAM_TABLE_NAME}-exam_set_id\` ON \`${EXAM_TABLE_NAME}\``,
    );
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${EXAM_TABLE_NAME}-exam_type_id\` ON \`${EXAM_TABLE_NAME}\``,
    );
    await queryRunner.query(`DROP TABLE \`${EXAM_TABLE_NAME}\``);
  }
}
