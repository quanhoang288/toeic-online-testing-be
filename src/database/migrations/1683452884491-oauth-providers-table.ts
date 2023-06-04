import { MigrationInterface, QueryRunner } from 'typeorm';

export class oauthProvidersTable1683452884491 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`oauth_providers\`
        (
            \`id\` int NOT NULL AUTO_INCREMENT,
            \`name\` varchar(255) NOT NULL,
            \`client_id\` varchar(255) NULL,
            \`client_secret\` varchar(255) NULL,
            \`token_url\` varchar(255) NULL,
            \`redirect_url\` varchar(255) NULL,
            \`user_info_url\` varchar(255) NULL,
            \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            UNIQUE INDEX \`idx-unique-oauth_providers-name\` (\`name\`),
            PRIMARY KEY (\`id\`)
        )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `idx-unique-oauth_providers-name` ON `permissions`',
    );
    await queryRunner.query('DROP TABLE `oauth_providers`');
  }
}
