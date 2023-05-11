import { MigrationInterface, QueryRunner } from 'typeorm';

export class createAccountsTable1683452871569 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`accounts\`
        (
            \`id\` int NOT NULL AUTO_INCREMENT,
            \`email\` varchar(255) NOT NULL,
            \`username\` varchar(255) NOT NULL,
            \`avatar\` varchar(255) NULL,
            \`role_id\` int NULL,
            \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            UNIQUE INDEX \`idx-unique-accounts-email\` (\`email\`),
            PRIMARY KEY (\`id\`)
        )`,
    );

    await queryRunner.query(`
        ALTER TABLE \`accounts\`
        ADD CONSTRAINT \`fk-accounts-role_id\`
            FOREIGN KEY (\`role_id\`) REFERENCES \`roles\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `idx-unique-accounts-email` ON `accounts`',
    );
    await queryRunner.query(
      'DROP FOREIGN KEY `fk-accounts-role_id` ON `accounts`',
    );
    await queryRunner.query('DROP TABLE `accounts`');
  }
}
