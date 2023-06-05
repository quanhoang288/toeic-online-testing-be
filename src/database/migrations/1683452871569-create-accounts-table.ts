import { MigrationInterface, QueryRunner } from 'typeorm';

export class createAccountsTable1683452871569 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`accounts\`
        (
            \`id\` int NOT NULL AUTO_INCREMENT,
            \`email\` varchar(255) NOT NULL,
            \`username\` varchar(255) NULL,
            \`password\` varchar(255) NULL,
            \`avatar\` varchar(255) NULL,
            \`access_token\` text NULL,
            \`refresh_token\` text NULL,
            \`access_token_expires_at\` TIMESTAMP(6) NULL,
            \`refresh_token_expires_at\` TIMESTAMP(6) NULL,
            \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            UNIQUE INDEX \`idx-unique-accounts-email\` (\`email\`),
            PRIMARY KEY (\`id\`)
        )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `idx-unique-accounts-email` ON `accounts`',
    );
    await queryRunner.query('DROP TABLE `accounts`');
  }
}
