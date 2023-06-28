import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { GroupChannelEntity } from '../../../database/entities/group-channel.entity';
import {
  FindOptionsOrder,
  FindOptionsWhere,
  In,
  Like,
  Repository,
} from 'typeorm';
import { ChannelPostEntity } from '../../../database/entities/channel-post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PostListItem } from '../dtos/post.dto';
import { GroupRequestToJoinStatus } from '../enums/group-request-to-join-status';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { GroupSortOption } from '../enums/group-sort-option';
import { Order } from '../../../common/constants/order';
import _ from 'lodash';
import { PostLikeEntity } from '../../../database/entities/post-like.entity';
import { PostFilterDto } from '../dtos/post-filter.dto';
import { AccountGroupEntity } from '../../../database/entities/account-group.entity';

@Injectable()
export class GroupChannelService {
  constructor(
    @InjectRepository(AccountGroupEntity)
    private readonly accountGroupRepository: Repository<AccountGroupEntity>,
    @InjectRepository(ChannelPostEntity)
    private readonly postRepository: Repository<ChannelPostEntity>,
    @InjectRepository(PostLikeEntity)
    private readonly postLikeRepository: Repository<PostLikeEntity>,
    @InjectRepository(GroupChannelEntity)
    private readonly channelRepository: Repository<GroupChannelEntity>,
  ) {}

  async getPosts(
    channelId: number,
    paginationOption: PostFilterDto,
    authUserId?: number,
  ): Promise<PaginationDto<PostListItem>> {
    const channel = await this.channelRepository.findOne({
      where: {
        id: channelId,
      },
      relations: ['group'],
    });
    if (!channel) {
      throw new BadRequestException('Channel not found');
    }

    const memberEntity = await this.accountGroupRepository.findOne({
      where: {
        accountId: authUserId,
        groupId: channel.group.id,
        requestToJoinStatus: GroupRequestToJoinStatus.ACCEPTED,
      },
    });
    if (!channel.group.isPublic && !memberEntity) {
      throw new ForbiddenException(
        'Only members of private group are allowed to view posts',
      );
    }

    const whereCond: FindOptionsWhere<ChannelPostEntity> = { channelId };

    if (!memberEntity?.isAdmin) {
      whereCond.isApproved = true;
    } else if (paginationOption.isApproved !== undefined) {
      whereCond.isApproved =
        paginationOption.isApproved === 'true' ||
        paginationOption.isApproved === '1';
    }

    if (paginationOption.q) {
      whereCond.content = Like(`%${paginationOption.q}%`);
    }

    const order: FindOptionsOrder<ChannelPostEntity> = {};
    if (paginationOption.sortOption === GroupSortOption.TRENDING) {
      order.numLikes = Order.DESC;
    }
    order.id = Order.DESC;

    const numRecords = await this.postRepository.count({ where: whereCond });
    const posts = await this.postRepository.find({
      where: whereCond,
      skip: paginationOption.skip,
      take: paginationOption.perPage,
      order,
      relations: ['creator'],
    });

    const likedPosts = await this.postLikeRepository.find({
      where: {
        postId: In(posts.map((post) => post.id)),
        createdBy: authUserId,
      },
    });

    return {
      page: paginationOption.page,
      pageCount: paginationOption.perPage,
      totalCount: numRecords,
      data: posts.map((post) => ({
        id: post.id,
        channelId: post.channelId,
        content: post.content,
        isPinned: post.isPinned,
        isApproved: post.isApproved,
        numComments: post.numComments,
        numLikes: post.numLikes,
        liked: likedPosts.some((likedPost) => likedPost.postId === post.id),
        creator: _.pick(post.creator, ['id', 'username', 'email', 'avatar']),
        createdAt: post.createdAt.toISOString(),
      })),
    };
  }
}
