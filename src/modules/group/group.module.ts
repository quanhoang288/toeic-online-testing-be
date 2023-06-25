import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '../user/user.module';
import { GroupChannelService } from './services/group-channel.service';
import { GroupService } from './services/group.service';
import { GroupEntity } from '../../database/entities/group.entity';
import { GroupChannelEntity } from '../../database/entities/group-channel.entity';
import { AccountGroupEntity } from '../../database/entities/account-group.entity';
import { GroupController } from './group.controller';
@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([
      GroupEntity,
      GroupChannelEntity,
      AccountGroupEntity,
    ]),
  ],
  providers: [GroupService, GroupChannelService],
  controllers: [GroupController],
})
export class GroupModule {}
