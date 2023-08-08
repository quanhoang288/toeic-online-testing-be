import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';
import _ from 'lodash';

import { PostCommentEntity } from '../../../database/entities/post-comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../../user/user.service';
import { PostDto, PostUpdateDto } from '../dtos/post.dto';
import { GroupRequestToJoinStatus } from '../enums/group-request-to-join-status';
import { CommentDto, CommentListItemDto } from '../dtos/comment.dto';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { PaginationOptionDto } from '../../../common/dtos/pagination-option.dto';
import { Order } from '../../../common/constants/order';
import { PostLikeEntity } from '../../../database/entities/post-like.entity';
import { GroupChannelEntity } from '../../../database/entities/group-channel.entity';
import { ChannelPostEntity } from '../../../database/entities/channel-post.entity';
import { TransactionService } from '../../../shared/services/transaction.service';

@Injectable()
export class PostService {
  constructor(
    private readonly userService: UserService,
    private readonly transactionService: TransactionService,
    @InjectRepository(ChannelPostEntity)
    private readonly postRepository: Repository<ChannelPostEntity>,
    @InjectRepository(PostLikeEntity)
    private readonly postLikeRepository: Repository<PostLikeEntity>,
    @InjectRepository(GroupChannelEntity)
    private readonly channelRepository: Repository<GroupChannelEntity>,
    @InjectRepository(PostCommentEntity)
    private readonly commentRepository: Repository<PostCommentEntity>,
  ) {}

  async createPost(authUserId: number, postDto: PostDto): Promise<void> {
    const user = await this.userService.findOneById(authUserId, true);
    const channel = await this.channelRepository.findOne({
      where: { id: postDto.channelId },
    });
    if (!channel) {
      throw new BadRequestException('Group channel not found');
    }

    const isGroupAdmin = (user.accountGroups || []).some(
      (accGroup) => accGroup.groupId === channel.groupId && accGroup.isAdmin,
    );

    if (
      !(user.accountGroups || []).some(
        (accGroup) =>
          accGroup.groupId === channel.groupId &&
          accGroup.requestToJoinStatus === GroupRequestToJoinStatus.ACCEPTED,
      )
    ) {
      throw new ForbiddenException(
        'User must be admin or a member of the group',
      );
    }

    await this.postRepository.save({
      ...postDto,
      numComments: 0,
      createdBy: authUserId,
      isApproved: isGroupAdmin ? true : false,
    });
  }

  async update(
    postId: number,
    authUserId: number,
    postDto: PostUpdateDto,
  ): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: {
        channel: true,
      },
    });
    if (!post) {
      throw new BadRequestException('Post not found');
    }

    const user = await this.userService.findOneById(authUserId, true);
    const isGroupAdmin = (user.accountGroups || []).some(
      (accGroup) =>
        accGroup.groupId === post.channel.groupId && accGroup.isAdmin,
    );

    if (post.createdBy !== authUserId && !isGroupAdmin) {
      throw new ForbiddenException(
        'User must be creator of the post or group admin to update this post',
      );
    }

    if (postDto.content !== undefined) {
      post.content = postDto.content;
    }

    if (isGroupAdmin && post.isPinned !== undefined) {
      post.isPinned = postDto.isPinned;
    }

    await post.save();
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
        createdAt: comment.createdAt.toISOString(),
      })),
    };
  }

  async createComment(
    postId: number,
    authUserId: number,
    commentDto: CommentDto,
  ): Promise<void> {
    const post = await this.postRepository.findOne({
      where: {
        id: postId,
      },
    });
    if (!post) {
      throw new BadRequestException('Post not found');
    }
    await this.transactionService.runInTransaction(async (queryRunner) => {
      await queryRunner.manager.getRepository(PostCommentEntity).save({
        ...commentDto,
        postId,
        createdBy: authUserId,
      });
      await queryRunner.manager
        .getRepository(ChannelPostEntity)
        .update({ id: post.id }, { numComments: post.numComments + 1 });
    });
  }

  async likePost(postId: number, userId: number): Promise<void> {
    const post = await this.postRepository.findOne({
      where: {
        id: postId,
      },
    });
    if (!postId) {
      throw new BadRequestException('Post not found');
    }

    const existingLike = await this.postLikeRepository.findOne({
      where: {
        createdBy: userId,
        postId,
      },
    });
    if (existingLike) {
      throw new BadRequestException('User already liked this post');
    }

    await this.transactionService.runInTransaction(async (queryManager) => {
      await queryManager.manager.getRepository(PostLikeEntity).save({
        postId,
        createdBy: userId,
      });
      await queryManager.manager.getRepository(ChannelPostEntity).update(
        { id: postId },
        {
          numLikes: post.numLikes + 1,
        },
      );
    });
  }

  async unlikePost(postId: number, userId: number): Promise<void> {
    const post = await this.postRepository.findOne({
      where: {
        id: postId,
      },
    });
    if (!postId) {
      throw new BadRequestException('Post not found');
    }

    const existingLike = await this.postLikeRepository.findOne({
      where: {
        createdBy: userId,
        postId,
      },
    });
    if (!existingLike) {
      throw new BadRequestException('User not liked this post yet');
    }

    await this.transactionService.runInTransaction(async (queryManager) => {
      await queryManager.manager.getRepository(PostLikeEntity).delete({
        postId,
        createdBy: userId,
      });
      await queryManager.manager.getRepository(ChannelPostEntity).update(
        { id: postId },
        {
          numLikes: post.numLikes - 1,
        },
      );
    });
  }
}
