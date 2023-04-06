import { MigrationInterface, QueryRunner } from 'typeorm';

export class initDbTables1680716899627 implements MigrationInterface {
  name = 'initDbTables1680716899627';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`permissions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`roles\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, UNIQUE INDEX \`idx-roles-name\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`oauth_providers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`name\` varchar(255) NOT NULL, \`client_id\` varchar(255) NULL, \`client_secret\` varchar(255) NULL, \`token_url\` varchar(255) NOT NULL, \`redirect_url\` varchar(255) NOT NULL, \`user_info_url\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`exam_registrations\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`exam_id\` int NOT NULL, \`account_id\` int NOT NULL, \`status\` varchar(255) NOT NULL DEFAULT 'accepted', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`exam_sets\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`sections\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`num_questions\` int NOT NULL, UNIQUE INDEX \`idx-sections-name\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`exam_sections\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`exam_id\` int NOT NULL, \`section_id\` int NOT NULL, \`section_name\` varchar(255) NOT NULL, \`section\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`exam_result_details\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`exam_result_id\` int NOT NULL, \`exam_section_id\` int NULL, \`question_id\` int NOT NULL, \`input_answer\` varchar(255) NULL, \`selected_answer_id\` int NULL, \`is_correct\` tinyint NULL, \`account_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`exam_results\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`exam_id\` int NOT NULL, \`account_id\` int NOT NULL, \`is_virtual\` tinyint NOT NULL DEFAULT 0, \`num_corrects\` int NOT NULL, \`time_taken_in_secs\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`exams\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`name\` varchar(255) NOT NULL, \`type\` varchar(255) NOT NULL, \`has_multiple_sections\` tinyint NOT NULL DEFAULT 1, \`time_limit_in_mins\` int NULL, \`exam_set_id\` int NULL, \`register_starts_at\` datetime NULL, \`register_ends_at\` datetime NULL, \`starts_at\` datetime NULL, \`num_participants\` int NULL, \`audio\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`answers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`type\` varchar(255) NOT NULL, \`text\` varchar(255) NOT NULL, \`is_correct\` tinyint NOT NULL DEFAULT 0, \`question_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`question_gaps\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`question_id\` int NOT NULL, \`start_pos\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`questions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`type\` varchar(255) NOT NULL, \`text\` varchar(255) NOT NULL, \`image_url\` varchar(255) NULL, \`question_set_id\` int NULL, \`explanation\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`question_set_gaps\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`question_set_id\` int NOT NULL, \`start_pos\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`question_sets\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`title\` varchar(255) NULL, \`text_context\` varchar(255) NULL, \`audio_url\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`question_archives\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`name\` varchar(255) NOT NULL, \`type\` varchar(255) NOT NULL, UNIQUE INDEX \`idx-question_archives-name\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`accounts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`email\` varchar(255) NOT NULL, \`username\` varchar(255) NOT NULL, \`avatar\` varchar(255) NULL, \`role_id\` int NOT NULL, UNIQUE INDEX \`idx-accounts-email\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`account_provider_linking\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`account_id\` int NOT NULL, \`provider_id\` int NOT NULL, \`access_token\` varchar(255) NULL, \`refresh_token\` varchar(255) NULL, \`access_token_expires_at\` datetime NULL, \`refresh_token_expires_at\` datetime NULL, UNIQUE INDEX \`unique-idx-account-provider-linking\` (\`account_id\`, \`provider_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`exam_details\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`exam_id\` int NOT NULL, \`exam_section_id\` int NULL, \`question_id\` int NULL, \`question_set_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`partial_result_details\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`partial_result_id\` int NOT NULL, \`exam_section_id\` int NULL, \`question_id\` int NOT NULL, \`selected_answer_id\` int NULL, \`is_correct\` tinyint NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`partial_results\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`exam_id\` int NULL, \`question_archive_id\` int NULL, \`account_id\` int NOT NULL, \`num_corrects\` int NOT NULL, \`time_taken_in_secs\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`question_archive_details\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`question_archive_id\` int NOT NULL, \`question_set_id\` int NULL, \`question_id\` int NULL, \`is_enabled\` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`question_set_images\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`question_set_id\` int NOT NULL, \`image_url\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`role_has_permissions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL, \`role_id\` int NOT NULL, \`permission_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );

    await queryRunner.query(
      `CREATE INDEX \`idx-role_has_permissions-role_id\` ON \`role_has_permissions\` (\`role_id\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`idx-role_has_permissions-permission_id\` ON \`role_has_permissions\` (\`permission_id\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`idx-question_archive_details-question_archive_id\` ON \`question_archive_details\` (\`question_archive_id\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`idx-question_archive_details-question_set_id\` ON \`question_archive_details\` (\`question_set_id\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`idx-question_archive_details-question_id\` ON \`question_archive_details\` (\`question_id\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`idx-account_provider_linking-account_id\` ON \`account_provider_linking\` (\`account_id\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`idx-account_provider_linking-provider_id\` ON \`account_provider_linking\` (\`provider_id\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`idx-exam_results-account_id\` ON \`exam_results\` (\`account_id\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`idx-exam_results-exam_id\` ON \`exam_results\` (\`exam_id\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`idx-partial_results-account_id\` ON \`partial_results\` (\`account_id\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`idx-partial_results-question_archive_id\` ON \`partial_results\` (\`question_archive_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_registrations\` ADD CONSTRAINT \`fk-exam_registrations-exam_id\` FOREIGN KEY (\`exam_id\`) REFERENCES \`exams\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_registrations\` ADD CONSTRAINT \`fk-exam_registrations-account_id\` FOREIGN KEY (\`account_id\`) REFERENCES \`accounts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_sections\` ADD CONSTRAINT \`fk-exam_sections-exam_id\` FOREIGN KEY (\`exam_id\`) REFERENCES \`exams\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_sections\` ADD CONSTRAINT \`fk-exam_sections-section\` FOREIGN KEY (\`section\`) REFERENCES \`sections\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_result_details\` ADD CONSTRAINT \`fk-exam_result_details-exam_result_id\` FOREIGN KEY (\`exam_result_id\`) REFERENCES \`exam_results\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_result_details\` ADD CONSTRAINT \`fk-exam_result_details-account_id\` FOREIGN KEY (\`account_id\`) REFERENCES \`accounts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_result_details\` ADD CONSTRAINT \`fk-exam_result_details-exam_section_id\` FOREIGN KEY (\`exam_section_id\`) REFERENCES \`exam_sections\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` ADD CONSTRAINT \`fk-exam_results-exam_id\` FOREIGN KEY (\`exam_id\`) REFERENCES \`exams\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` ADD CONSTRAINT \`fk-exam_results-account_id\` FOREIGN KEY (\`account_id\`) REFERENCES \`accounts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exams\` ADD CONSTRAINT \`fk-exams-exam_set_id\` FOREIGN KEY (\`exam_set_id\`) REFERENCES \`exam_sets\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`answers\` ADD CONSTRAINT \`fk-answers-question_id\` FOREIGN KEY (\`question_id\`) REFERENCES \`questions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_gaps\` ADD CONSTRAINT \`fk-question_gaps-question_id\` FOREIGN KEY (\`question_id\`) REFERENCES \`questions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`questions\` ADD CONSTRAINT \`fk-questions-question_set_id\` FOREIGN KEY (\`question_set_id\`) REFERENCES \`question_sets\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_set_gaps\` ADD CONSTRAINT \`fk-question_set_gaps-question_set_id\` FOREIGN KEY (\`question_set_id\`) REFERENCES \`question_sets\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`accounts\` ADD CONSTRAINT \`fk-accounts-role_id\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` ADD CONSTRAINT \`fk-account_provider_linking-account_id\` FOREIGN KEY (\`account_id\`) REFERENCES \`accounts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` ADD CONSTRAINT \`fk-account_provider_linking-provider_id\` FOREIGN KEY (\`provider_id\`) REFERENCES \`oauth_providers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_details\` ADD CONSTRAINT \`fk-exam_details-exam_id\` FOREIGN KEY (\`exam_id\`) REFERENCES \`exams\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_details\` ADD CONSTRAINT \`fk-exam_details-exam_section_id\` FOREIGN KEY (\`exam_section_id\`) REFERENCES \`exam_sections\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_details\` ADD CONSTRAINT \`fk-exam_details-question_id\` FOREIGN KEY (\`question_id\`) REFERENCES \`questions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_details\` ADD CONSTRAINT \`fk-exam_details-question_set_id\` FOREIGN KEY (\`question_set_id\`) REFERENCES \`question_sets\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` ADD CONSTRAINT \`fk-question_archive_details-question_archive_id\` FOREIGN KEY (\`question_archive_id\`) REFERENCES \`question_archives\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` ADD CONSTRAINT \`fk-question_archive_details-question_set_id\` FOREIGN KEY (\`question_set_id\`) REFERENCES \`question_sets\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` ADD CONSTRAINT \`fk-question_archive_details-question_id\` FOREIGN KEY (\`question_id\`) REFERENCES \`questions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_set_images\` ADD CONSTRAINT \`fk-question_set_images-question_set_id\` FOREIGN KEY (\`question_set_id\`) REFERENCES \`question_sets\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` ADD CONSTRAINT \`fk-role_has_permissions-role_id\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` ADD CONSTRAINT \`fk-role_has_permissions-permission_id\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` ADD CONSTRAINT \`fk-partial_results-account_id\` FOREIGN KEY (\`account_id\`) REFERENCES \`accounts\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` ADD CONSTRAINT \`fk-partial_results-question_archive_id\` FOREIGN KEY (\`question_archive_id\`) REFERENCES \`question_archives\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` DROP FOREIGN KEY \`fk-partial_results-question_archive_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` DROP FOREIGN KEY \`fk-partial_results-account_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` DROP FOREIGN KEY \`fk-role_has_permissions-permission_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` DROP FOREIGN KEY \`fk-role_has_permissions-role_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_set_images\` DROP FOREIGN KEY \`fk-question_set_images-question_set_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` DROP FOREIGN KEY \`fk-question_archive_details-question_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` DROP FOREIGN KEY \`fk-question_archive_details-question_set_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` DROP FOREIGN KEY \`fk-question_archive_details-question_archive_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_details\` DROP FOREIGN KEY \`fk-exam_details-question_set_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_details\` DROP FOREIGN KEY \`fk-exam_details-question_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_details\` DROP FOREIGN KEY \`fk-exam_details-exam_section_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_details\` DROP FOREIGN KEY \`fk-exam_details-exam_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` DROP FOREIGN KEY \`fk-account_provider_linking-provider_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` DROP FOREIGN KEY \`fk-account_provider_linking-account_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`accounts\` DROP FOREIGN KEY \`fk-accounts-role_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_set_gaps\` DROP FOREIGN KEY \`fk-question_set_gaps-question_set_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`questions\` DROP FOREIGN KEY \`fk-questions-question_set_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_gaps\` DROP FOREIGN KEY \`fk-question_gaps-question_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`answers\` DROP FOREIGN KEY \`fk-answers-question_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`exams\` DROP FOREIGN KEY \`fk-exams-exam_set_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` DROP FOREIGN KEY \`fk-exam_results-account_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` DROP FOREIGN KEY \`fk-exam_results-exam_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_result_details\` DROP FOREIGN KEY \`fk-exam_result_details-exam_section_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_result_details\` DROP FOREIGN KEY \`fk-exam_result_details-account_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_result_details\` DROP FOREIGN KEY \`fk-exam_result_details-exam_result_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_sections\` DROP FOREIGN KEY \`fk-exam_sections-section\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_sections\` DROP FOREIGN KEY \`fk-exam_sections-exam_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_registrations\` DROP FOREIGN KEY \`fk-exam_registrations-account_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_registrations\` DROP FOREIGN KEY \`fk-exam_registrations-exam_id\``,
    );
    await queryRunner.query(
      `DROP INDEX \`idx-partial_results-question_archive_id\` ON \`partial_results\``,
    );
    await queryRunner.query(
      `DROP INDEX \`idx-partial_results-account_id\` ON \`partial_results\``,
    );
    await queryRunner.query(
      `DROP INDEX \`idx-exam_results-exam_id\` ON \`exam_results\``,
    );
    await queryRunner.query(
      `DROP INDEX \`idx-exam_results-account_id\` ON \`exam_results\``,
    );
    await queryRunner.query(
      `DROP INDEX \`idx-account_provider_linking-provider_id\` ON \`account_provider_linking\``,
    );
    await queryRunner.query(
      `DROP INDEX \`idx-account_provider_linking-account_id\` ON \`account_provider_linking\``,
    );
    await queryRunner.query(
      `DROP INDEX \`idx-question_archive_details-question_id\` ON \`question_archive_details\``,
    );
    await queryRunner.query(
      `DROP INDEX \`idx-question_archive_details-question_set_id\` ON \`question_archive_details\``,
    );
    await queryRunner.query(
      `DROP INDEX \`idx-question_archive_details-question_archive_id\` ON \`question_archive_details\``,
    );
    await queryRunner.query(
      `DROP INDEX \`idx-role_has_permissions-permission_id\` ON \`role_has_permissions\``,
    );
    await queryRunner.query(
      `DROP INDEX \`idx-role_has_permissions-role_id\` ON \`role_has_permissions\``,
    );
    await queryRunner.query(
      `DROP INDEX \`unique-idx-account-provider-linking\` ON \`account_provider_linking\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`partial_results\` DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` ADD PRIMARY KEY (\`account_id\`, \`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` CHANGE \`question_archive_id\` \`question_archive_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`partial_results\` DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` ADD PRIMARY KEY (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`exam_results\` DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` ADD PRIMARY KEY (\`account_id\`, \`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`exam_results\` DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` ADD PRIMARY KEY (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` ADD PRIMARY KEY (\`account_id\`, \`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` ADD PRIMARY KEY (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` ADD PRIMARY KEY (\`question_archive_id\`, \`id\`, \`question_set_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` CHANGE \`question_id\` \`question_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` ADD PRIMARY KEY (\`question_archive_id\`, \`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` CHANGE \`question_set_id\` \`question_set_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` ADD PRIMARY KEY (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` ADD PRIMARY KEY (\`role_id\`, \`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` ADD PRIMARY KEY (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` ADD PRIMARY KEY (\`permission_id\`, \`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` ADD PRIMARY KEY (\`role_id\`, \`permission_id\`, \`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` ADD PRIMARY KEY (\`id\`, \`question_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` ADD PRIMARY KEY (\`id\`, \`question_set_id\`, \`question_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` ADD PRIMARY KEY (\`question_archive_id\`, \`id\`, \`question_set_id\`, \`question_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`partial_results\` DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` ADD PRIMARY KEY (\`account_id\`, \`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`partial_results\` DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` ADD PRIMARY KEY (\`question_archive_id\`, \`account_id\`, \`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` ADD PRIMARY KEY (\`provider_id\`, \`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` ADD PRIMARY KEY (\`account_id\`, \`provider_id\`, \`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`unique-idx-account-provider-linking\` ON \`account_provider_linking\` (\`account_id\`, \`provider_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`exam_results\` DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` ADD PRIMARY KEY (\`account_id\`, \`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`exam_results\` DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` ADD PRIMARY KEY (\`exam_id\`, \`account_id\`, \`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`partial_results\` DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` ADD PRIMARY KEY (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`exam_results\` DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` ADD PRIMARY KEY (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` ADD PRIMARY KEY (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` ADD PRIMARY KEY (\`question_archive_id\`, \`id\`, \`question_set_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` ADD PRIMARY KEY (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` ADD PRIMARY KEY (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` DROP COLUMN \`updated_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` DROP COLUMN \`created_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` DROP COLUMN \`id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` DROP COLUMN \`is_enabled\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` DROP COLUMN \`question_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` DROP COLUMN \`question_set_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` DROP COLUMN \`updated_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` DROP COLUMN \`created_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` DROP COLUMN \`id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` DROP COLUMN \`time_taken_in_secs\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` DROP COLUMN \`num_corrects\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` DROP COLUMN \`exam_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` DROP COLUMN \`updated_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` DROP COLUMN \`created_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` DROP COLUMN \`id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` DROP COLUMN \`refresh_token_expires_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` DROP COLUMN \`access_token_expires_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` DROP COLUMN \`refresh_token\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` DROP COLUMN \`access_token\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` DROP COLUMN \`updated_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` DROP COLUMN \`created_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` DROP COLUMN \`id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` DROP COLUMN \`time_taken_in_secs\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` DROP COLUMN \`num_corrects\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` DROP COLUMN \`is_virtual\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` DROP COLUMN \`updated_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` DROP COLUMN \`created_at\``,
    );
    await queryRunner.query(`ALTER TABLE \`exam_results\` DROP COLUMN \`id\``);
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` ADD \`time_taken_in_secs\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` ADD \`num_corrects\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` ADD \`exam_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` ADD \`updated_at\` datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` ADD \`created_at\` datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` ADD \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` ADD PRIMARY KEY (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`partial_results\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` ADD \`time_taken_in_secs\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` ADD \`num_corrects\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` ADD \`is_virtual\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` ADD \`updated_at\` datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` ADD \`created_at\` datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` ADD \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` ADD PRIMARY KEY (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`exam_results\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` ADD \`refresh_token_expires_at\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` ADD \`access_token_expires_at\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` ADD \`refresh_token\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` ADD \`access_token\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` ADD \`updated_at\` datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` ADD \`created_at\` datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` ADD \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` ADD PRIMARY KEY (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account_provider_linking\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` ADD \`question_set_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` ADD \`is_enabled\` tinyint NOT NULL DEFAULT 1`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` ADD \`question_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` ADD \`updated_at\` datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` ADD \`created_at\` datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` ADD \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` ADD PRIMARY KEY (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`question_archive_details\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` ADD \`updated_at\` datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` ADD \`created_at\` datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` ADD \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` ADD PRIMARY KEY (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_has_permissions\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(`DROP TABLE \`role_has_permissions\``);
    await queryRunner.query(`DROP TABLE \`question_set_images\``);
    await queryRunner.query(`DROP TABLE \`question_archive_details\``);
    await queryRunner.query(`DROP TABLE \`partial_results\``);
    await queryRunner.query(`DROP TABLE \`partial_result_details\``);
    await queryRunner.query(`DROP TABLE \`exam_details\``);
    await queryRunner.query(
      `DROP INDEX \`unique-idx-account-provider-linking\` ON \`account_provider_linking\``,
    );
    await queryRunner.query(`DROP TABLE \`account_provider_linking\``);
    await queryRunner.query(
      `DROP INDEX \`idx-accounts-email\` ON \`accounts\``,
    );
    await queryRunner.query(`DROP TABLE \`accounts\``);
    await queryRunner.query(
      `DROP INDEX \`idx-question_archives-name\` ON \`question_archives\``,
    );
    await queryRunner.query(`DROP TABLE \`question_archives\``);
    await queryRunner.query(`DROP TABLE \`question_sets\``);
    await queryRunner.query(`DROP TABLE \`question_set_gaps\``);
    await queryRunner.query(`DROP TABLE \`questions\``);
    await queryRunner.query(`DROP TABLE \`question_gaps\``);
    await queryRunner.query(`DROP TABLE \`answers\``);
    await queryRunner.query(`DROP TABLE \`exams\``);
    await queryRunner.query(`DROP TABLE \`exam_results\``);
    await queryRunner.query(`DROP TABLE \`exam_result_details\``);
    await queryRunner.query(`DROP TABLE \`exam_sections\``);
    await queryRunner.query(`DROP INDEX \`idx-sections-name\` ON \`sections\``);
    await queryRunner.query(`DROP TABLE \`sections\``);
    await queryRunner.query(`DROP TABLE \`exam_sets\``);
    await queryRunner.query(`DROP TABLE \`exam_registrations\``);
    await queryRunner.query(`DROP TABLE \`oauth_providers\``);
    await queryRunner.query(`DROP INDEX \`idx-roles-name\` ON \`roles\``);
    await queryRunner.query(`DROP TABLE \`roles\``);
    await queryRunner.query(`DROP TABLE \`permissions\``);
  }
}
