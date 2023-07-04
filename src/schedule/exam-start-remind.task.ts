import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import moment from 'moment-timezone';

import { MailType } from '../common/constants/mail-type';
import { QueueNames } from '../common/constants/queue-names';
import { ExamEntity } from '../database/entities/exam.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ExamRegistrationEntity } from '../database/entities/exam-registration.entity';
import { ExamRegistrationStatus } from '../common/constants/exam-registration-status';
import { AwsSQSService } from '../shared/services/aws-sqs.service';
import { AppConfigService } from '../shared/services/app-config.service';

@Injectable()
export class ExamStartRemindTask {
  private readonly logger = new Logger(ExamStartRemindTask.name);

  constructor(
    @InjectRepository(ExamEntity)
    private readonly examRepository: Repository<ExamEntity>,
    @InjectRepository(ExamRegistrationEntity)
    private readonly examRegistrationRepository: Repository<ExamRegistrationEntity>,
    private readonly sqsService: AwsSQSService,
    private readonly appConfigService: AppConfigService,
  ) {}

  @Cron('0 0 */2 * * *')
  async handleCron(): Promise<void> {
    this.logger.debug('Triggered exam start mail sending task every 2 hours');
    const examsToSendRemindMail = await this.getExamsToSendRemind();
    if (!examsToSendRemindMail.length) {
      this.logger.warn('No exams start time due for remind mails');
      return;
    }
    console.log('exams to send remind mail', examsToSendRemindMail);
    try {
      for (const exam of examsToSendRemindMail) {
        await this.sqsService.sendMessage(
          this.appConfigService.awsSQSConfig.mailQueueUrl,
          {
            type: MailType.EXAM_START_REMINDER,
            data: exam,
          },
        );
      }
    } catch (error) {
      this.logger.error(`Error adding job to ${QueueNames.MAIL_SEND_QUEUE}`);
      this.logger.error(error);
    }
  }

  private async getExamsToSendRemind(): Promise<
    {
      examId: number;
      clientDetailUrl: string;
      examName: string;
      startsAt: string;
      timeLimits: string;
      registrars: { email: string; username: string }[];
    }[]
  > {
    const now = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    const exams = await this.examRepository
      .createQueryBuilder('e')
      .where('e.startsAt IS NOT NULL AND e.timeLimitInMins IS NOT NULL')
      .andWhere(
        `TIMESTAMPDIFF(MINUTE, '${now}', e.startsAt) > 0 AND TIMESTAMPDIFF(MINUTE, '${now}', e.startsAt) <= 120`,
      )
      .getMany();
    const registrationsByExam = await this.examRegistrationRepository.find({
      where: {
        examId: In(exams.map((exam) => exam.id)),
        status: ExamRegistrationStatus.ACCEPTED,
      },
      relations: ['account'],
    });

    return exams
      .filter((exam) =>
        registrationsByExam.some(
          (registration) => registration.examId === exam.id,
        ),
      )
      .map((exam) => {
        const timeLimitInHour = Math.floor(exam.timeLimitInMins / 60);
        const timeLimitInMin = exam.timeLimitInMins % 60;
        return {
          examId: exam.id,
          examName: exam.name,
          clientDetailUrl: `${this.appConfigService.apiClientBaseUrl}/exams/${exam.id}`,
          startsAt: moment(exam.startsAt).format('YYYY/MM/DD HH:mm'),
          timeLimits: `${timeLimitInHour}h${timeLimitInMin}m`,
          registrars: registrationsByExam
            .filter((registration) => registration.examId === exam.id)
            .map((u) => ({
              email: u.account.email,
              username: u.account.username,
            })),
        };
      });
  }
}
