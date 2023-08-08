import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FindOptionsWhere, In, Like, Repository } from 'typeorm';
import _ from 'lodash';

import { GroupFilterDto } from '../dtos/group-filter.dto';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { UserService } from '../../user/user.service';
import { GroupEntity } from '../../../database/entities/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionService } from '../../../shared/services/transaction.service';
import { GroupChannelEntity } from '../../../database/entities/group-channel.entity';
import { AccountGroupEntity } from '../../../database/entities/account-group.entity';
import { GroupDetailDto, GroupDto, GroupListItemDto } from '../dtos/group.dto';
import { GroupRequestToJoinStatus } from '../enums/group-request-to-join-status';
import {
  GroupRequestToJoinDto,
  RequestToJoinGroupResponseDto,
} from '../dtos/group-request-to-join.dto';
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
    const groupWhereCond: FindOptionsWhere<GroupEntity> = {};
    if (searchParams.name) {
      groupWhereCond.name = Like(`%${searchParams.name}%`);
    }

    const qb = this.groupRepository
      .createQueryBuilder('g')
      .innerJoinAndSelect('g.creator', 'c')
      .where('1 = 1');
    if (searchParams.name) {
      qb.andWhere('g.name LIKE :name', { name: `%${searchParams.name}%` });
    }

    if (authUserId && searchParams.joined !== undefined) {
      qb.andWhere(
        `${
          searchParams.joined === 'true' || searchParams.joined === '1'
            ? 'EXISTS'
            : 'NOT EXISTS'
        } (SELECT 1 FROM account_group ag WHERE ag.group_id = g.id AND ag.request_to_join_status = '${
          GroupRequestToJoinStatus.ACCEPTED
        }' AND ag.account_id = :accountId)`,
        { accountId: authUserId },
      );
    }

    const numRecords = await qb.getCount();

    const groups = await qb
      .skip(searchParams.skip)
      .take(searchParams.perPage)
      .getMany();

    const accountGroups = await this.accountGroupRepository.find({
      where: {
        accountId: authUserId,
      },
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
        requestToJoinStatus:
          accountGroups.find((accGroup) => accGroup.groupId === group.id)
            ?.requestToJoinStatus || null,
      })),
    };
  }

  async show(groupId: number, authUserId?: number): Promise<GroupDetailDto> {
    const group = await this.groupRepository.findOne({
      where: {
        id: groupId,
      },
      relations: {
        channels: true,
        creator: true,
      },
    });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const isAdmin = !!(await this.accountGroupRepository.findOne({
      where: {
        accountId: authUserId,
        groupId,
        isAdmin: true,
      },
    }));

    return {
      id: group.id,
      name: group.name,
      isPublic: group.isPublic,
      channels: group.channels.map((c) => ({
        id: c.id,
        name: c.name,
      })),
      isAdmin,
      creator: {
        ..._.pick(group.creator, ['id', 'username', 'email', 'avatar']),
        isAdmin: true,
      },
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
      await queryRunner.manager.getRepository(GroupChannelEntity).save(
        (groupDto.channels || [{ name: 'General' }]).map((channel) => ({
          ...channel,
          groupId: createdGroup.id,
        })),
      );

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
            requestToJoinStatus: GroupRequestToJoinStatus.ACCEPTED,
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
      relations: ['accountGroups', 'channels'],
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
              (groupDto.channels || [])
                .filter(
                  (c) =>
                    !channelsToRemove.some(
                      (channelToRemove) => channelToRemove.id === c.id,
                    ),
                )
                .map((c) => ({ ...c, groupId: group.id })),
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
        const newMembers = groupDto.members.filter(
          (m) =>
            !(group.accountGroups || []).some(
              (accGroup) =>
                accGroup.accountId === m.id &&
                accGroup.requestToJoinStatus ===
                  GroupRequestToJoinStatus.ACCEPTED,
            ),
        );
        const membersToUpdate = groupDto.members.filter(
          (m) =>
            !membersToRemove.some(
              (memberToRemove) => memberToRemove.id === m.id,
            ),
        );

        await Promise.all([
          queryRunner.manager.getRepository(AccountGroupEntity).save(
            newMembers.map((m) => ({
              accountId: m.id,
              groupId: group.id,
              isAdmin: m.isAdmin,
              requestToJoinStatus: GroupRequestToJoinStatus.ACCEPTED,
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
            accountId: In(membersToRemove.map((m) => m.accountId)),
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

  async requestToJoinGroup(
    groupId: number,
    userId: number,
  ): Promise<RequestToJoinGroupResponseDto> {
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

    const requestToJoinStatus = group.isPublic
      ? GroupRequestToJoinStatus.ACCEPTED
      : GroupRequestToJoinStatus.PENDING;

    await this.accountGroupRepository.save({
      id: existingRequest?.id,
      accountId: userId,
      groupId,
      requestToJoinStatus,
    });

    return { requestToJoinStatus };
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
    if (!group) {
      throw new BadRequestException('Group not found');
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
    authUserId: number,
    acceptRequest: boolean,
  ): Promise<void> {
    const group = await this.groupRepository.findOneBy({ id: groupId });
    if (!group) {
      throw new BadRequestException('Group not found');
    }
    const isAdmin = !!(await this.accountGroupRepository.findOne({
      where: {
        accountId: authUserId,
        groupId,
        isAdmin: true,
      },
    }));
    if (!isAdmin) {
      throw new ForbiddenException(
        'User must be an admin to process request to join group',
      );
    }

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
