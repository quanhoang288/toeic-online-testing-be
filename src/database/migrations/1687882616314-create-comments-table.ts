import { MigrationInterface, QueryRunner } from 'typeorm';
import { POST_COMMENT_TABLE_NAME } from '../entities/post-comment.entity';
import { ACCOUNT_TABLE_NAME } from '../entities/account.entity';
import { CHANNEL_POST_TABLE_NAME } from '../entities/channel-post.entity';

export class createCommentsTable1687882616314 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`${POST_COMMENT_TABLE_NAME}\`
                            (
                                \`id\` int NOT NULL AUTO_INCREMENT,
                                \`post_id\` int NOT NULL,
                                \`content\` text NOT NULL,
                                \`created_by\` int NOT NULL,
                                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                                \`deleted_at\` timestamp(6) NULL,
                                PRIMARY KEY (\`id\`)
                            )`,
    );
    await queryRunner.query(`
    ALTER TABLE \`${POST_COMMENT_TABLE_NAME}\`
      ADD CONSTRAINT \`fk-${POST_COMMENT_TABLE_NAME}-created_by\`
        FOREIGN KEY (\`created_by\`) REFERENCES \`${ACCOUNT_TABLE_NAME}\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
  `);
    await queryRunner.query(`
    ALTER TABLE \`${POST_COMMENT_TABLE_NAME}\`
      ADD CONSTRAINT \`fk-${POST_COMMENT_TABLE_NAME}-post_id\`
        FOREIGN KEY (\`post_id\`) REFERENCES \`${CHANNEL_POST_TABLE_NAME}\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${CHANNEL_POST_TABLE_NAME}-account_id\` ON \`${CHANNEL_POST_TABLE_NAME}\``,
    );
    await queryRunner.query(
      `DROP FOREIGN KEY \`fk-${CHANNEL_POST_TABLE_NAME}-post_id\` ON \`${CHANNEL_POST_TABLE_NAME}\``,
    );
    await queryRunner.query(`DROP TABLE \`${POST_COMMENT_TABLE_NAME}\``);
  }
}
