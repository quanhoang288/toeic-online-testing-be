import { MigrationInterface, QueryRunner } from 'typeorm';

export class createPermissionsTable1683452851677 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`permissions\`
        (
            \`id\` int NOT NULL AUTO_INCREMENT,
            \`name\` varchar(255) NOT NULL,
            \`description\` varchar(255) NULL,
            \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            UNIQUE INDEX \`idx-unique-permissions-name\` (\`name\`),
            PRIMARY KEY (\`id\`)
        )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `idx-unique-permissions-name` ON `permissions`',
    );
    await queryRunner.query('DROP TABLE `permissions`');
  }
}
