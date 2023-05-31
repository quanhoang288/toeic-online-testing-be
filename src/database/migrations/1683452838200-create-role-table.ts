import { MigrationInterface, QueryRunner } from 'typeorm';

export class createRoleTable1683452838200 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`roles\`
       (
         \`id\` int NOT NULL AUTO_INCREMENT,
         \`name\` varchar(255) NOT NULL,
         \`description\` varchar(255) NULL,
         \`is_admin\` tinyint(2) NOT NULL DEFAULT 0,
         \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
         \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
         UNIQUE INDEX \`idx-unique-roles-name\` (\`name\`),
         PRIMARY KEY (\`id\`)
       )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `idx-unique-roles-name` ON `roles`');
    await queryRunner.query('DROP TABLE `roles`');
  }
}
