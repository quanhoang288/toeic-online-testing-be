import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { AccountEntity } from './account.entity';
import { ChannelPostEntity } from './channel-post.entity';

export const POST_COMMENT_TABLE_NAME = 'post_comments';

@Entity({ name: POST_COMMENT_TABLE_NAME })
export class PostCommentEntity extends AbstractEntity {
  @Column()
  content!: string;

  @Column()
  createdBy!: number;

  @Column()
  postId!: number;

  @ManyToOne(() => ChannelPostEntity, (post) => post.comments)
  @JoinColumn({ name: 'post_id' })
  post: ChannelPostEntity;

  @ManyToOne(() => AccountEntity)
  @JoinColumn({ name: 'created_by' })
  creator: AccountEntity;
}
