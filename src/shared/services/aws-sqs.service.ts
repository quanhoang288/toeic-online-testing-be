import { Injectable } from '@nestjs/common';
import { AppConfigService } from './app-config.service';
import {
  DeleteMessageCommandInput,
  Message,
  ReceiveMessageCommandInput,
  SQS,
  SendMessageCommand,
} from '@aws-sdk/client-sqs';

@Injectable()
export class AwsSQSService {
  private sqs: SQS;

  constructor(private readonly appConfigService: AppConfigService) {
    this.sqs = new SQS({
      region: this.appConfigService.awsSQSConfig.region,
      credentials: {
        accessKeyId: this.appConfigService.awsSQSConfig.accessKeyId,
        secretAccessKey: this.appConfigService.awsSQSConfig.secretAccessKey,
      },
    });
  }

  async sendMessage(
    queueUrl: string,
    body: Record<string, unknown>,
  ): Promise<void> {
    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(body),
    });
    await this.sqs.send(command);
  }

  async receiveMessages(
    queueUrl: string,
    maxNumberOfMessages: number,
  ): Promise<Message[]> {
    const params: ReceiveMessageCommandInput = {
      QueueUrl: queueUrl,
      MaxNumberOfMessages: maxNumberOfMessages,
    };

    try {
      const response = await this.sqs.receiveMessage(params);
      return response.Messages || [];
    } catch (error) {
      console.error('Failed to receive messages from SQS:', error);
      throw error;
    }
  }

  async deleteMessage(queueUrl: string, receiptHandle: string): Promise<void> {
    const params: DeleteMessageCommandInput = {
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    };

    try {
      await this.sqs.deleteMessage(params);
    } catch (error) {
      console.error('Failed to delete message from SQS:', error);
      throw error;
    }
  }
}
