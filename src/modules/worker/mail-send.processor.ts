import { Injectable, Logger } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { QueueNames } from '../../common/constants/queue-names';

@Injectable()
export class MailSendProcessor {
  private readonly logger = new Logger(MailSendProcessor.name);

  @SqsMessageHandler(QueueNames.MAIL_SEND_QUEUE, false)
  handleMessage(message: AWS.SQS.Message): void {
    this.logger.debug(message);
  }
}
