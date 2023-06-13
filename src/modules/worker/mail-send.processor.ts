import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SqsConsumerEventHandler, SqsMessageHandler } from '@ssut/nestjs-sqs';
import { Repository } from 'typeorm';
import moment from 'moment-timezone';

import { QueueNames } from '../../common/constants/queue-names';
import { ExamRegistrationEntity } from '../../database/entities/exam-registration.entity';
import { ExamEntity } from '../../database/entities/exam.entity';
import { AwsSESService } from '../../shared/services/aws-ses.service';
import { MailType } from '../../common/constants/mail-type';
import { AppConfigService } from '../../shared/services/app-config.service';
import { ExamRegistrationStatus } from '../../common/constants/exam-registration-status';

@Injectable()
export class MailSendProcessor {
  private readonly logger = new Logger(MailSendProcessor.name);

  constructor(
    @InjectRepository(ExamEntity)
    private readonly examRepository: Repository<ExamEntity>,
    @InjectRepository(ExamRegistrationEntity)
    private readonly examRegistrationRepository: Repository<ExamRegistrationEntity>,
    private readonly sesService: AwsSESService,
    private readonly appConfigService: AppConfigService,
  ) {}

  @SqsMessageHandler(QueueNames.MAIL_SEND_QUEUE, false)
  async handleMessage(message: AWS.SQS.Message): Promise<void> {
    this.logger.log(`Processing job from ${QueueNames.MAIL_SEND_QUEUE} queue`);
    this.logger.debug(message);
    const mailJobBody = JSON.parse(message.Body);
    const examId = mailJobBody.examId;
    const exam = await this.examRepository.findOneBy({
      id: examId,
    });
    if (!exam) {
      this.logger.error(`No exam found with exam id ${examId}`);
    }
    const examRegistrations = await this.examRegistrationRepository.find({
      where: {
        examId,
      },
      relations: ['account'],
    });

    if (mailJobBody.type === MailType.EXAM_START_REMINDER) {
      await this.sesService.sendEmailWithTemplate(
        examRegistrations
          .filter(
            (registration) =>
              registration.status === ExamRegistrationStatus.ACCEPTED,
          )
          .map((registration) => ({
            address: registration.account?.email,
            replacementData: {
              examName: exam.name,
              startsAt: moment(exam.startsAt).format('YYYY-MM-DD hh:mm'),
              username:
                registration.account.username || registration.account.email,
            },
          })),
        this.appConfigService.awsSESConfig.examStartRemindTemplateName,
      );
    }
    this.logger.log(`Processed job done`);
  }

  @SqsConsumerEventHandler(QueueNames.MAIL_SEND_QUEUE, 'processing_error')
  public onProcessingError(error: Error, message: AWS.SQS.Message): void {
    this.logger.debug(error);
    this.logger.debug(message);
  }
}
