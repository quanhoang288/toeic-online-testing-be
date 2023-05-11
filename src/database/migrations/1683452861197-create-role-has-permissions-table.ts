import { MigrationInterface, QueryRunner } from 'typeorm';

export class createRoleHasPermissionsTable1683452861197
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`role_has_permissions\`
        (
            \`id\` int NOT NULL AUTO_INCREMENT,
            \`role_id\` int NOT NULL,
            \`permission_id\` int NULL,
            \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            PRIMARY KEY (\`id\`)
        ) ENGINE = InnoDB`,
    );

    await queryRunner.query(`
      ALTER TABLE \`role_has_permissions\`
        ADD CONSTRAINT \`fk-role_has_permissions-role_id\`
          FOREIGN KEY (\`role_id\`) REFERENCES \`roles\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE \`role_has_permissions\`
        ADD CONSTRAINT \`fk-role_has_permissions-permission_id\`
          FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP FOREIGN KEY `fk-role_has_permissions-role_id` ON `role_has_permissions`',
    );
    await queryRunner.query(
      'DROP FOREIGN KEY `fk-role_has_permissions-permission_id` ON `role_has_permissions`',
    );
    await queryRunner.query('DROP TABLE `role_has_permissions`');
  }
}
