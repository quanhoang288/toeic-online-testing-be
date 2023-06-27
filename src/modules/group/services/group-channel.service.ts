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
import { PostCommentEntity } from '../../../database/entities/post-comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../../user/user.service';
import { PostDto, PostListItem } from '../dtos/post.dto';
import { GroupRequestToJoinStatus } from '../enums/group-request-to-join-status';
import { CommentDto, CommentListItemDto } from '../dtos/comment.dto';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { PaginationOptionDto } from '../../../common/dtos/pagination-option.dto';
import { GroupSortOption } from '../enums/group-sort-option';
import { Order } from '../../../common/constants/order';
import _ from 'lodash';
import { PostLikeEntity } from '../../../database/entities/post-like.entity';
import { PostFilterDto } from '../dtos/post-filter.dto';

@Injectable()
export class GroupChannelService {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(ChannelPostEntity)
    private readonly postRepository: Repository<ChannelPostEntity>,
    @InjectRepository(PostLikeEntity)
    private readonly postLikeRepository: Repository<PostLikeEntity>,
    @InjectRepository(GroupChannelEntity)
    private readonly channelRepository: Repository<GroupChannelEntity>,
    @InjectRepository(PostCommentEntity)
    private readonly commentRepository: Repository<PostCommentEntity>,
  ) {}

  async getPosts(
    channelId: number,
    paginationOption: PostFilterDto,
    authUserId?: number,
  ): Promise<PaginationDto<PostListItem>> {
    const whereCond: FindOptionsWhere<ChannelPostEntity> = { channelId };
    if (paginationOption.isApproved !== undefined) {
      whereCond.isApproved = paginationOption.isApproved;
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
        liked: likedPosts.some((likedPost) => likedPost.postId === post.id),
        creator: _.pick(post.creator, ['id', 'username', 'email', 'avatar']),
      })),
    };
  }

  async createPost(authUserId: number, postDto: PostDto): Promise<void> {
    const user = await this.userService.findOneById(authUserId, true);
    const channel = await this.channelRepository.findOne({
      where: { id: postDto.channelId },
    });
    if (!channel) {
      throw new BadRequestException('Group channel not found');
    }

    if (
      !(user.accountGroups || []).some(
        (accGroup) =>
          accGroup.groupId === channel.groupId &&
          accGroup.requestToJoinStatus === GroupRequestToJoinStatus.ACCEPTED,
      )
    ) {
      throw new ForbiddenException('User must be member of the group');
    }

    const isAdmin = user.roles.some((role) => role.isAdmin);
    await this.postRepository.save({
      ...postDto,
      numComments: 0,
      createdBy: authUserId,
      isApproved: isAdmin ? true : false,
    });
  }

  async processPostRequest(
    postId: number,
    authUserId: number,
    accept: boolean,
  ): Promise<void> {
    const post = await this.postRepository.findOne({
      where: {
        id: postId,
      },
      relations: ['channel'],
    });
    if (!post) {
      throw new BadRequestException('Post not found');
    }

    const user = await this.userService.findOneById(authUserId);
    if (
      !(user.accountGroups || []).some(
        (accGroup) =>
          accGroup.groupId === post.channel.groupId && accGroup.isAdmin,
      )
    ) {
      throw new ForbiddenException('User must be admin of the group');
    }

    post.isApproved = accept;
    await post.save();
  }

  async deletePost(postId: number, authUserId: number): Promise<void> {
    const post = await this.postRepository.findOne({
      where: {
        id: postId,
      },
      relations: ['channel'],
    });
    if (!post) {
      throw new BadRequestException('Post not found');
    }

    const user = await this.userService.findOneById(authUserId);
    if (
      post.createdBy !== authUserId ||
      !(user.accountGroups || []).some(
        (accGroup) =>
          accGroup.groupId === post.channel.groupId && accGroup.isAdmin,
      )
    ) {
      throw new ForbiddenException(
        'User must be creator of post or admin of group to delete this post',
      );
    }

    await this.postRepository.softDelete({ id: postId });
  }

  async getComments(
    postId: number,
    paginationOption: PaginationOptionDto,
  ): Promise<PaginationDto<CommentListItemDto>> {
    const whereCond: FindOptionsWhere<PostCommentEntity> = { postId };
    const numRecords = await this.commentRepository.count({ where: whereCond });
    const comments = await this.commentRepository.find({
      where: whereCond,
      skip: paginationOption.skip,
      take: paginationOption.perPage,
      order: {
        id: Order.DESC,
      },
      relations: ['creator'],
    });
    return {
      page: paginationOption.page,
      pageCount: paginationOption.perPage,
      totalCount: numRecords,
      data: comments.map((comment) => ({
        id: comment.id,
        postId: comment.postId,
        content: comment.content,
        creator: _.pick(comment.creator, ['id', 'username', 'email', 'avatar']),
      })),
    };
  }

  async createComment(
    postId: number,
    authUserId: number,
    commentDto: CommentDto,
  ): Promise<void> {
    await this.commentRepository.save({
      ...commentDto,
      postId,
      createdBy: authUserId,
    });
  }
}
