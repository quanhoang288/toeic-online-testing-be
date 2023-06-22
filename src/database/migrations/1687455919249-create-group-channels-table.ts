import { MigrationInterface, QueryRunner } from 'typeorm';
import { GROUP_CHANNEL_TABLE_NAME } from '../entities/group-channel.entity';
import { GROUP_TABLE_NAME } from '../entities/group.entity';

export class createGroupChannelsTable1687455919249
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`${GROUP_CHANNEL_TABLE_NAME}\`
                (
                    \`id\` int NOT NULL AUTO_INCREMENT,
                    \`group_id\` int NOT NULL,
                    \`name\` varchar(255) NOT NULL,
                    \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                    \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                    PRIMARY KEY (\`id\`)
                )`,
    );
    await queryRunner.query(`
    ALTER TABLE \`${GROUP_CHANNEL_TABLE_NAME}\`
      ADD CONSTRAINT \`fk-${GROUP_CHANNEL_TABLE_NAME}-group_id\`
        FOREIGN KEY (\`group_id\`) REFERENCES \`${GROUP_TABLE_NAME}\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${GROUP_CHANNEL_TABLE_NAME}-group_id\` ON \`${GROUP_CHANNEL_TABLE_NAME}\``,
    );
    await queryRunner.query(`DROP TABLE \`${GROUP_CHANNEL_TABLE_NAME}\``);
  }
}
