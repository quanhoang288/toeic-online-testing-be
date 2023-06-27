import { MigrationInterface, QueryRunner } from 'typeorm';
import { CHANNEL_POST_TABLE_NAME } from '../entities/channel-post.entity';
import { GROUP_CHANNEL_TABLE_NAME } from '../entities/group-channel.entity';
import { ACCOUNT_TABLE_NAME } from '../entities/account.entity';

export class createChannelPostsTable1687882601477
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`${CHANNEL_POST_TABLE_NAME}\`
                        (
                            \`id\` int NOT NULL AUTO_INCREMENT,
                            \`channel_id\` int NOT NULL,
                            \`content\` text NOT NULL,
                            \`num_comments\` int NOT NULL DEFAULT 0,
                            \`num_likes\` int NOT NULL DEFAULT 0,
                            \`is_pinned\` tinyint(2) NOT NULL DEFAULT 0,
                            \`is_approved\` tinyint(2) NOT NULL DEFAULT 0,
                            \`created_by\` int NOT NULL,
                            \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                            \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                            \`deleted_at\` timestamp(6) NULL,
                            PRIMARY KEY (\`id\`)
                        )`,
    );
    await queryRunner.query(`
            ALTER TABLE \`${CHANNEL_POST_TABLE_NAME}\`
              ADD CONSTRAINT \`fk-${CHANNEL_POST_TABLE_NAME}-created_by\`
                FOREIGN KEY (\`created_by\`) REFERENCES \`${ACCOUNT_TABLE_NAME}\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
          `);
    await queryRunner.query(`
            ALTER TABLE \`${CHANNEL_POST_TABLE_NAME}\`
              ADD CONSTRAINT \`fk-${CHANNEL_POST_TABLE_NAME}-channel_id\`
                FOREIGN KEY (\`channel_id\`) REFERENCES \`${GROUP_CHANNEL_TABLE_NAME}\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
          `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${CHANNEL_POST_TABLE_NAME}-account_id\` ON \`${CHANNEL_POST_TABLE_NAME}\``,
    );
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${CHANNEL_POST_TABLE_NAME}-channel_id\` ON \`${CHANNEL_POST_TABLE_NAME}\``,
    );
    await queryRunner.query(`DROP TABLE \`${CHANNEL_POST_TABLE_NAME}\``);
  }
}
