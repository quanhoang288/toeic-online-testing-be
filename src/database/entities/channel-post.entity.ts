import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../common/models/abstract.entity';
import { GroupChannelEntity } from './group-channel.entity';
import { AccountEntity } from './account.entity';
import { PostCommentEntity } from './post-comment.entity';
import { PostLikeEntity } from './post-like.entity';

export const CHANNEL_POST_TABLE_NAME = 'channel_posts';

@Entity({ name: CHANNEL_POST_TABLE_NAME })
export class ChannelPostEntity extends AbstractEntity {
  @Column()
  content!: string;

  @Column()
  numComments!: number;

  @Column()
  numLikes!: number;

  @Column()
  isPinned!: boolean;

  @Column()
  isApproved!: boolean;

  @Column()
  createdBy!: number;

  @Column()
  channelId!: number;

  @OneToMany(() => PostLikeEntity, (like) => like.post)
  likes: PostLikeEntity[];

  @OneToMany(() => PostCommentEntity, (comment) => comment.post)
  comments: PostCommentEntity[];

  @ManyToOne(() => GroupChannelEntity, (channel) => channel.posts)
  @JoinColumn({ name: 'channel_id' })
  channel: GroupChannelEntity;

  @ManyToOne(() => AccountEntity, (account) => account.createdPosts)
  @JoinColumn({ name: 'created_by' })
  creator: AccountEntity;
}
