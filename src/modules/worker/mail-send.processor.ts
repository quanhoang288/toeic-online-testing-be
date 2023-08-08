import { Injectable, Logger } from '@nestjs/common';
import { SqsConsumerEventHandler, SqsMessageHandler } from '@ssut/nestjs-sqs';

import { QueueNames } from '../../common/constants/queue-names';
import { AwsSESService } from '../../shared/services/aws-ses.service';
import { MailType } from '../../common/constants/mail-type';
import { AppConfigService } from '../../shared/services/app-config.service';
import moment from 'moment-timezone';

@Injectable()
export class MailSendProcessor {
  private readonly logger = new Logger(MailSendProcessor.name);

  constructor(
    private readonly sesService: AwsSESService,
    private readonly appConfigService: AppConfigService,
  ) {}

  @SqsMessageHandler(QueueNames.MAIL_SEND_QUEUE, false)
  async handleMessage(message: AWS.SQS.Message): Promise<void> {
    this.logger.debug(
      `Processing job from ${QueueNames.MAIL_SEND_QUEUE} queue`,
    );
    this.logger.debug(message);
    const { type: mailType, data } = JSON.parse(message.Body);

    if (mailType === MailType.EXAM_START_REMINDER) {
      this.logger.debug('Sending exam start reminder mail');
      const res = await this.sesService.sendEmailWithTemplate(
        (data.registrars || []).map(
          (registrar: { email: string; username: string }) => ({
            address: registrar.email,
            replacementData: {
              examName: data.examName,
              examUrl: data.clientDetailUrl,
              startsAt: moment(data.startsAt)
                .subtract(7, 'hours')
                .format('YYYY/MM/DD HH:mm'),
              timeLimits: data.timeLimits,
              username: registrar.username || registrar.email,
            },
          }),
        ),
        this.appConfigService.awsSESConfig.examStartRemindTemplateName,
        {
          examName: '',
          examUrl: '',
          startsAt: '',
          timeLimits: '',
          username: '',
        },
      );
      if (!res) {
        this.logger.error(`Sending mail failed`);
      }
    }
    this.logger.log(`Processed job done`);
  }

  @SqsConsumerEventHandler(QueueNames.MAIL_SEND_QUEUE, 'processing_error')
  public onProcessingError(error: Error, message: AWS.SQS.Message): void {
    this.logger.debug(error);
    this.logger.debug(message);
  }
}
