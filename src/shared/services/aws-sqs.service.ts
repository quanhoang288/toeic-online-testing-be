import { Injectable } from '@nestjs/common';
import { SQS } from 'aws-sdk';
import { AppConfigService } from './app-config.service';

@Injectable()
export class AwsSQSService {
  private sqs: SQS;

  constructor(private readonly appConfigService: AppConfigService) {
    this.sqs = new SQS({
      region: this.appConfigService.awsSQSConfig.region,
    });
  }

  async receiveMessages(
    queueUrl: string,
    maxNumberOfMessages: number,
  ): Promise<SQS.Message[]> {
    const params: SQS.ReceiveMessageRequest = {
      QueueUrl: queueUrl,
      MaxNumberOfMessages: maxNumberOfMessages,
    };

    try {
      const response = await this.sqs.receiveMessage(params).promise();
      return response.Messages || [];
    } catch (error) {
      console.error('Failed to receive messages from SQS:', error);
      throw error;
    }
  }

  async deleteMessage(queueUrl: string, receiptHandle: string): Promise<void> {
    const params: SQS.DeleteMessageRequest = {
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    };

    try {
      await this.sqs.deleteMessage(params).promise();
    } catch (error) {
      console.error('Failed to delete message from SQS:', error);
      throw error;
    }
  }
}
