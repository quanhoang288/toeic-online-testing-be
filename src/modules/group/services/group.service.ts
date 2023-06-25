import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import _ from 'lodash';

import { GroupFilterDto } from '../dtos/group-filter.dto';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { UserService } from '../../user/user.service';
import { GroupEntity } from '../../../database/entities/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionService } from '../../../shared/services/transaction.service';
import { GroupChannelEntity } from '../../../database/entities/group-channel.entity';
import { AccountGroupEntity } from '../../../database/entities/account-group.entity';
import { GroupDto, GroupListItemDto } from '../dtos/group.dto';
import { GroupRequestToJoinStatus } from '../enums/group-request-to-join-status';
import { GroupRequestToJoinDto } from '../dtos/group-request-to-join.dto';
import { GroupMemberDto } from '../dtos/group-member.dto';

@Injectable()
export class GroupService {
  constructor(
    private readonly userService: UserService,
    private readonly transactionService: TransactionService,
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
    @InjectRepository(AccountGroupEntity)
    private readonly accountGroupRepository: Repository<AccountGroupEntity>,
  ) {}

  async list(
    searchParams: GroupFilterDto,
    authUserId?: number,
  ): Promise<PaginationDto<GroupListItemDto>> {
    const whereCond: FindOptionsWhere<GroupEntity> = {};
    if (searchParams.name) {
      whereCond.name = searchParams.name;
    }

    if (authUserId) {
      const user = await this.userService.findOneById(authUserId, true);
      const isAdmin = user.roles.some((role) => role.isAdmin);
      if (!isAdmin) {
        whereCond.id = In(
          (user.accountGroups || [])
            .filter(
              (accGroup) =>
                accGroup.requestToJoinStatus ===
                GroupRequestToJoinStatus.ACCEPTED,
            )
            .map((accGroup) => accGroup.groupId),
        );
      }
    }

    if (searchParams.joined) {
      whereCond.accountGroups = {
        requestToJoinStatus: GroupRequestToJoinStatus.ACCEPTED,
      };
    }

    const numRecords = await this.groupRepository.count({
      where: whereCond,
    });

    const groups = await this.groupRepository.find({
      where: whereCond,
      relations: ['accountGroups', 'creator'],
      skip: searchParams.skip,
      take: searchParams.perPage,
    });

    return {
      page: searchParams.page,
      pageCount: searchParams.perPage,
      totalCount: numRecords,
      data: groups.map((group) => ({
        id: group.id,
        name: group.name,
        isPublic: group.isPublic,
        creator: _.pick(group.creator, ['id', 'username', 'email', 'avatar']),
        requestToJoinStatus: group.accountGroups.find(
          (accGroup) => accGroup.accountId === authUserId,
        )?.requestToJoinStatus,
      })),
    };
  }

  async show(groupId: number): Promise<GroupDto> {
    const group = await this.groupRepository.findOne({
      where: {
        id: groupId,
      },
      relations: {
        channels: true,
        accountGroups: {
          account: true,
        },
      },
    });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const requestsToJoin = [];
    const groupMembers = [];
    for (const accGroup of group.accountGroups || []) {
      const userInfo = {
        id: accGroup.account.id,
        username: accGroup.account.username,
        email: accGroup.account.email,
        avatar: accGroup.account.avatar,
      };
      if (accGroup.requestToJoinStatus === GroupRequestToJoinStatus.PENDING) {
        requestsToJoin.push(userInfo);
      } else if (
        accGroup.requestToJoinStatus === GroupRequestToJoinStatus.ACCEPTED
      ) {
        groupMembers.push(userInfo);
      }
    }

    return {
      id: group.id,
      name: group.name,
      isPublic: group.isPublic,
      channels: group.channels.map((c) => ({
        id: c.id,
        name: c.name,
      })),
      members: groupMembers,
      requestsToJoin: requestsToJoin,
    };
  }

  async create(groupDto: GroupDto, authUserId: number): Promise<void> {
    const user = await this.userService.findOneById(authUserId, true);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const existingGroup = await this.groupRepository.findOneBy({
      name: groupDto.name,
    });
    if (existingGroup) {
      throw new BadRequestException('Group with given name already existed');
    }

    await this.transactionService.runInTransaction(async (queryRunner) => {
      const createdGroup = await queryRunner.manager
        .getRepository(GroupEntity)
        .save({
          name: groupDto.name,
          isPublic: groupDto.isPublic,
          createdBy: authUserId,
        });

      // create default channel for the newly created group if no channels are passed in dto
      await queryRunner.manager
        .getRepository(GroupChannelEntity)
        .save(groupDto.channels || [{ name: 'General' }]);

      // group members
      await queryRunner.manager.getRepository(AccountGroupEntity).save(
        (groupDto.members || [])
          .concat([
            {
              id: authUserId,
              isAdmin: true,
            },
          ])
          .map((m) => ({
            accountId: m.id,
            groupId: createdGroup.id,
            isAdmin: m.isAdmin,
          })),
      );
    });
  }

  async update(
    groupId: number,
    groupDto: Partial<GroupDto>,
    authUserId: number,
  ): Promise<void> {
    const group = await this.groupRepository.findOne({
      where: {
        id: groupId,
      },
      relations: ['accountGroups'],
    });
    if (!group) {
      throw new BadRequestException('Group not found');
    }

    if (
      !(group.accountGroups || []).some(
        (accGroup) => accGroup.isAdmin && accGroup.accountId === authUserId,
      )
    ) {
      throw new ForbiddenException('User is not admin of group');
    }

    await this.transactionService.runInTransaction(async (queryRunner) => {
      await queryRunner.manager
        .getRepository(GroupEntity)
        .update(
          group.id,
          _.omitBy(_.pick(groupDto, ['name', 'isPublic']), _.isNil),
        );
      if (groupDto.channels) {
        const channelsToRemove = (group.channels || []).filter(
          (existingChannel) =>
            !(groupDto.channels || []).some((c) => c.id === existingChannel.id),
        );
        await Promise.all([
          queryRunner.manager
            .getRepository(GroupChannelEntity)
            .save(
              (groupDto.channels || []).filter(
                (c) =>
                  !channelsToRemove.some(
                    (channelToRemove) => channelToRemove.id === c.id,
                  ),
              ),
            ),
          queryRunner.manager
            .getRepository(GroupChannelEntity)
            .softDelete({ id: In(channelsToRemove.map((c) => c.id)) }),
        ]);
      }
      if (groupDto.members) {
        const membersToRemove = (group.accountGroups || []).filter(
          (accGroup) =>
            !groupDto.members.some(
              (m) =>
                accGroup.accountId === m.id &&
                accGroup.requestToJoinStatus ===
                  GroupRequestToJoinStatus.ACCEPTED,
            ),
        );
        const newMembers = groupDto.members.filter((m) => !m.id);
        const membersToUpdate = groupDto.members.filter((m) => m.id);

        await Promise.all([
          queryRunner.manager.getRepository(AccountGroupEntity).save(
            newMembers.map((m) => ({
              accountId: m.id,
              groupId: group.id,
              isAdmin: m.isAdmin,
            })),
          ),
          membersToUpdate.map((m) =>
            queryRunner.manager
              .getRepository(AccountGroupEntity)
              .update(
                { accountId: m.id, groupId: group.id },
                { isAdmin: m.isAdmin },
              ),
          ),
          queryRunner.manager.getRepository(AccountGroupEntity).delete({
            accountId: In(membersToRemove.map((m) => m.id)),
            groupId: group.id,
          }),
        ]);
      }
    });
  }

  async delete(groupId: number, authUserId: number): Promise<void> {
    const group = await this.groupRepository.findOne({
      where: {
        id: groupId,
      },
      relations: ['accountGroups'],
    });
    if (!group) {
      throw new BadRequestException('Group not found');
    }
    if (group.createdBy !== authUserId) {
      throw new ForbiddenException('User is not creator of this group');
    }

    await this.transactionService.runInTransaction(async (queryRunner) => {
      await queryRunner.manager
        .getRepository(AccountGroupEntity)
        .delete({ groupId });
      await queryRunner.manager
        .getRepository(GroupEntity)
        .softDelete({ id: groupId });
    });
  }

  async requestToJoinGroup(groupId: number, userId: number) {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['accountGroups'],
    });

    if (
      user.accountGroups.some(
        (accGroup) =>
          accGroup.id === group.id &&
          accGroup.requestToJoinStatus === GroupRequestToJoinStatus.ACCEPTED,
      )
    ) {
      throw new BadRequestException('User already in group');
    }

    const existingRequest = group.accountGroups.find(
      (accGroup) => accGroup.accountId === userId,
    );
    if (
      existingRequest &&
      existingRequest.requestToJoinStatus === GroupRequestToJoinStatus.PENDING
    ) {
      throw new BadRequestException(
        'User already sent a request to join this group',
      );
    }

    await this.accountGroupRepository.save({
      id: existingRequest?.id,
      accountId: userId,
      groupId,
      requestToJoinStatus: GroupRequestToJoinStatus.PENDING,
    });
  }

  async cancelRequestToJoinGroup(
    groupId: number,
    userId: number,
  ): Promise<void> {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['accountGroups'],
    });

    if (
      !user.accountGroups.some(
        (accGroup) =>
          accGroup.groupId === group.id &&
          accGroup.requestToJoinStatus === GroupRequestToJoinStatus.ACCEPTED,
      )
    ) {
      throw new BadRequestException('User not in group');
    }

    const existingRequest = group.accountGroups.find(
      (accGroup) => accGroup.accountId === userId,
    );
    if (
      !existingRequest ||
      existingRequest.requestToJoinStatus !== GroupRequestToJoinStatus.PENDING
    ) {
      throw new BadRequestException(
        'User not requested yet or request has already been cancelled',
      );
    }

    existingRequest.requestToJoinStatus = GroupRequestToJoinStatus.CANCELLED;
    await existingRequest.save();
  }

  async getRequestsToJoinGroup(
    groupId: number,
    authUserId: number,
  ): Promise<GroupRequestToJoinDto[]> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: {
        accountGroups: {
          account: true,
        },
      },
    });
    if (!group) {
      throw new BadRequestException('Group not found');
    }

    if (
      !group.accountGroups.some(
        (accGroup) => accGroup.accountId === authUserId && accGroup.isAdmin,
      )
    ) {
      throw new ForbiddenException(
        'User must be group admin to view request lists to join group',
      );
    }

    return (group.accountGroups || [])
      .filter(
        (accGroup) =>
          accGroup.requestToJoinStatus === GroupRequestToJoinStatus.PENDING,
      )
      .map((accGroup) => ({
        id: accGroup.accountId,
        username: accGroup.account.username,
        email: accGroup.account.email,
        avatar: accGroup.account.avatar,
      }));
  }

  async getGroupMembers(groupId: number): Promise<GroupMemberDto[]> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: {
        accountGroups: {
          account: true,
        },
      },
    });
    if (!group) {
      throw new BadRequestException('Group not found');
    }

    return (group.accountGroups || [])
      .filter(
        (accGroup) =>
          accGroup.requestToJoinStatus === GroupRequestToJoinStatus.ACCEPTED,
      )
      .map((accGroup) => ({
        id: accGroup.accountId,
        username: accGroup.account.username,
        email: accGroup.account.email,
        avatar: accGroup.account.avatar,
        isAdmin: accGroup.isAdmin,
      }));
  }

  async processRequestToJoinGroup(
    groupId: number,
    userId: number,
    acceptRequest: boolean,
  ): Promise<void> {
    const requestToJoin = await this.accountGroupRepository.findOne({
      where: {
        accountId: userId,
        groupId,
      },
    });
    if (!requestToJoin) {
      throw new BadRequestException(
        'User not requested to join this group yet',
      );
    }
    if (
      requestToJoin.requestToJoinStatus !== GroupRequestToJoinStatus.PENDING
    ) {
      throw new BadRequestException(
        'Request has been processed or cancelled by user',
      );
    }

    requestToJoin.requestToJoinStatus = acceptRequest
      ? GroupRequestToJoinStatus.ACCEPTED
      : GroupRequestToJoinStatus.REJECTED;

    await this.accountGroupRepository.save(requestToJoin);
  }
}
