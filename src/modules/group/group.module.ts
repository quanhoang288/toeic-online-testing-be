import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '../user/user.module';
import { GroupChannelService } from './services/group-channel.service';
import { GroupService } from './services/group.service';
import { GroupEntity } from '../../database/entities/group.entity';
import { GroupChannelEntity } from '../../database/entities/group-channel.entity';
import { AccountGroupEntity } from '../../database/entities/account-group.entity';
import { GroupController } from './controllers/group.controller';
import { ChannelPostEntity } from '../../database/entities/channel-post.entity';
import { PostCommentEntity } from '../../database/entities/post-comment.entity';
import { PostLikeEntity } from '../../database/entities/post-like.entity';
import { GroupChannelController } from './controllers/group-channel.controller';
import { PostController } from './controllers/post.controller';
@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([
      GroupEntity,
      GroupChannelEntity,
      AccountGroupEntity,
      GroupChannelEntity,
      ChannelPostEntity,
      PostCommentEntity,
      PostLikeEntity,
    ]),
  ],
  providers: [GroupService, GroupChannelService],
  controllers: [GroupController, GroupChannelController, PostController],
})
export class GroupModule {}
