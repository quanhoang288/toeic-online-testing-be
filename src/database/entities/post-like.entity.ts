import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { AccountEntity } from './account.entity';
import { ChannelPostEntity } from './channel-post.entity';

export const POST_LIKE_TABLE_NAME = 'post_likes';

@Entity({ name: POST_LIKE_TABLE_NAME })
export class PostLikeEntity extends AbstractEntity {
  @Column()
  postId!: number;

  @Column()
  createdBy!: number;

  @ManyToOne(() => ChannelPostEntity, (post) => post.likes)
  @JoinColumn({ name: 'post_id' })
  post: ChannelPostEntity;

  @ManyToOne(() => AccountEntity)
  @JoinColumn({ name: 'created_by' })
  creator: AccountEntity;
}
