import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThan, MoreThan, Repository } from 'typeorm';
import moment from 'moment-timezone';

import { AccountHasRoleEntity } from '../../database/entities/account-has-role.entity';
import { AccountEntity } from '../../database/entities/account.entity';
import { RoleEntity } from '../../database/entities/role.entity';
import { Role } from '../../common/constants/role';
import { ExamResultEntity } from '../../database/entities/exam-result.entity';
import { QuestionArchiveResultEntity } from '../../database/entities/question-archive-result.entity';
import { AppConfigService } from '../../shared/services/app-config.service';
import { TodayStats } from './dtos/today-stats.dto';
import { StatsByDate } from './dtos/stats-by-date.dto';
import { ExamEntity } from '../../database/entities/exam.entity';
import { ExamScope } from '../../common/constants/exam-scope';
import { QuestionArchiveEntity } from '../../database/entities/question-archive.entity';

@Injectable()
export class StatsService {
  constructor(
    private readonly appConfigService: AppConfigService,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleEntity: Repository<RoleEntity>,
    @InjectRepository(AccountHasRoleEntity)
    private readonly accountHasRoleRepository: Repository<AccountHasRoleEntity>,
    @InjectRepository(ExamEntity)
    private readonly examRepository: Repository<ExamEntity>,
    @InjectRepository(ExamResultEntity)
    private readonly examResultRepository: Repository<ExamResultEntity>,
    @InjectRepository(QuestionArchiveEntity)
    private readonly questionArchiveRepository: Repository<QuestionArchiveEntity>,
    @InjectRepository(QuestionArchiveResultEntity)
    private readonly questionArchiveResultRepository: Repository<QuestionArchiveResultEntity>,
  ) {}

  async getTodayStats(): Promise<TodayStats> {
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);
    const vipRole = await this.roleEntity.findOneBy({ name: Role.VIP_USER });

    const numUpgrades = await this.accountHasRoleRepository.count({
      where: {
        roleId: vipRole.id,
        updatedAt: LessThan(moment(now).add(1, 'day').toDate()),
        expiresAt: MoreThan(now),
      },
    });
    const numAccounts = await this.accountRepository.count({
      where: {
        createdAt: LessThan(moment(now).add(1, 'day').toDate()),
      },
    });
    const numExams = await this.examRepository.count();
    const numVipExams = await this.examRepository.count({
      where: { accessScope: ExamScope.VIP },
    });
    const numQuestionArchives = await this.questionArchiveRepository.count();

    const revenueToday =
      (await this.accountHasRoleRepository
        .createQueryBuilder('ahr')
        .where('ahr.roleId = :roleId', { roleId: vipRole.id })
        .andWhere('ahr.expiresAt > :now', { now })
        .andWhere('DATE(ahr.createdAt) = :createDate', {
          createDate: moment(now).format('YYYY-MM-DD'),
        })
        .getCount()) * this.appConfigService.upgradeVipUserFee;
    const revenueYesterday =
      (await this.accountHasRoleRepository
        .createQueryBuilder('ahr')
        .where('ahr.roleId = :roleId', { roleId: vipRole.id })
        .andWhere('ahr.expiresAt > :now', { now })
        .where('DATE(ahr.createdAt) = :createDate', {
          createDate: moment(now).subtract(1, 'day').format('YYYY-MM-DD'),
        })
        .getCount()) * this.appConfigService.upgradeVipUserFee;
    return {
      numAccounts,
      numUpgrades,
      numExams,
      numVipExams,
      numQuestionArchives,
      revenue: revenueToday,
      revenueYesterday,
    };
  }

  async getStatsByDate(from: string, to: string): Promise<StatsByDate> {
    const fromDate = new Date(from);
    fromDate.setUTCHours(0, 0, 0, 0);
    let isGroupByHour = false;
    let toDate: Date;
    if (from === to) {
      isGroupByHour = true;
      toDate = new Date(from);
      toDate.setUTCHours(23, 59, 59, 999);
    } else {
      toDate = new Date(to);
      toDate.setUTCHours(23, 59, 59, 999);
    }

    console.log('fromDate', fromDate);
    console.log('toDate', toDate);

    // revenue
    const vipRole = await this.roleEntity.findOneBy({ name: Role.VIP_USER });
    const upgradeFilterCond = {
      updatedAt: Between(fromDate, toDate),
      expiresAt: MoreThan(new Date()),
      roleId: vipRole.id,
    };
    const revenueStats = (
      (await this.accountHasRoleRepository
        .createQueryBuilder('ahr')
        .select([
          `${
            isGroupByHour
              ? "CONCAT(HOUR(ahr.updatedAt), ':00')"
              : 'DATE(ahr.updatedAt)'
          }  as timestampCol`,
          `COUNT(ahr.id) * ${this.appConfigService.upgradeVipUserFee}  as revenue`,
        ])
        .where(upgradeFilterCond)
        .groupBy('timestampCol')
        .getRawMany()) as { timestampCol: string; revenue: string }[]
    ).map((revenueGroup) => ({
      timestampCol: isGroupByHour
        ? revenueGroup.timestampCol
        : moment(revenueGroup.timestampCol).format('YYYY-MM-DD'),
      revenue: parseInt(revenueGroup.revenue),
    }));

    // user registration/user upgrade stats
    const numNewAccountsGroups = (
      (await this.accountRepository
        .createQueryBuilder('a')
        .select([
          `${
            isGroupByHour
              ? "CONCAT(HOUR(a.createdAt), ':00')"
              : 'DATE(a.createdAt)'
          } as timestampCol`,
          'COUNT(a.id) as cnt',
        ])
        .where({
          createdAt: Between(fromDate, toDate),
        })
        .groupBy('timestampCol')
        .getRawMany()) as { timestampCol: string; cnt: string }[]
    ).map((numAccountsGroup) => ({
      timestampCol: isGroupByHour
        ? numAccountsGroup.timestampCol
        : moment(numAccountsGroup.timestampCol).format('YYYY-MM-DD'),
      cnt: parseInt(numAccountsGroup.cnt),
    }));

    // exam attempts stats
    const examAttemptFilterCond = {
      createdAt: Between(fromDate, toDate),
    };

    const numExamAttemptsGroups = (
      (await this.examResultRepository
        .createQueryBuilder('er')
        .select([
          `${
            isGroupByHour
              ? "CONCAT(HOUR(er.createdAt), ':00')"
              : 'DATE(er.createdAt)'
          }  as timestampCol`,
          'COUNT(er.id) as cnt',
        ])
        .where(examAttemptFilterCond)
        .groupBy('timestampCol')
        .getRawMany()) as { timestampCol: string; cnt: string }[]
    ).map((numExamAttemptGroup) => ({
      timestampCol: isGroupByHour
        ? numExamAttemptGroup.timestampCol
        : moment(numExamAttemptGroup.timestampCol).format('YYYY-MM-DD'),
      cnt: parseInt(numExamAttemptGroup.cnt),
    }));

    console.log('>>>>>>>>>>>>>>>', numExamAttemptsGroups);

    // practice attempts stats
    const questionArchiveAttemptFilterCond = {
      createdAt: Between(fromDate, toDate),
    };
    const numQuestionArchiveAttemptGroups = (
      (await this.questionArchiveResultRepository
        .createQueryBuilder('qar')
        .select([
          `${
            isGroupByHour
              ? "CONCAT(HOUR(qar.createdAt), ':00')"
              : 'DATE(qar.createdAt)'
          }  as timestampCol`,
          'COUNT(qar.id) as cnt',
        ])
        .where(questionArchiveAttemptFilterCond)
        .groupBy('timestampCol')
        .getRawMany()) as { timestampCol: string; cnt: string }[]
    ).map((numQuestionArchiveAttemptGroup) => ({
      timestampCol: isGroupByHour
        ? numQuestionArchiveAttemptGroup.timestampCol
        : moment(numQuestionArchiveAttemptGroup.timestampCol).format(
            'YYYY-MM-DD',
          ),
      cnt: parseInt(numQuestionArchiveAttemptGroup.cnt),
    }));
    return {
      accountStats: numNewAccountsGroups,
      revenueStats: revenueStats,
      examAttemptStats: numExamAttemptsGroups,
      questionArchiveAttemptStats: numQuestionArchiveAttemptGroups,
    };
  }
}
