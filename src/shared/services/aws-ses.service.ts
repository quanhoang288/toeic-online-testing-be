import { Injectable } from '@nestjs/common';
import AWS from 'aws-sdk';
import { AppConfigService } from './app-config.service';

@Injectable()
export class AwsSESService {
  private ses: AWS.SES;

  constructor(private readonly appConfigService: AppConfigService) {
    this.ses = new AWS.SES({
      region: 'ap-southeast-1',
    });
  }

  async sendBulkEmails(tos: string[]): Promise<void> {
    const params = {
      Destinations: [
        {
          Destination: {
            ToAddresses: tos,
          },
          ReplacementTemplateData:
            '{ "REPLACEMENT_TAG_NAME":"REPLACEMENT_VALUE" }',
        },
      ],
      Source: this.appConfigService.awsSESConfig.sourceEmail,
      Template: 'TEMPLATE_NAME' /* required */,
      DefaultTemplateData: '{ "REPLACEMENT_TAG_NAME":"REPLACEMENT_VALUE" }',
    };

    try {
      await this.ses.sendBulkTemplatedEmail(params).promise();
    } catch (error) {
      console.log('Error sending emails', error);
    }

    console.log('Mail sent successfully');
  }
}
