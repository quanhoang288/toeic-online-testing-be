import { Injectable } from '@nestjs/common';
import { SESClient, SendBulkTemplatedEmailCommand } from '@aws-sdk/client-ses';

import { AppConfigService } from './app-config.service';

@Injectable()
export class AwsSESService {
  private ses: SESClient;

  constructor(private readonly appConfigService: AppConfigService) {
    this.ses = new SESClient({
      region: this.appConfigService.awsSESConfig.region,
      credentials: {
        accessKeyId: this.appConfigService.awsSESConfig.accessKeyId,
        secretAccessKey: this.appConfigService.awsSESConfig.secretAccessKey,
      },
    });
  }

  async sendEmailWithTemplate(
    recipients: { address: string; replacementData: Record<string, unknown> }[],
    templateName: string,
  ): Promise<boolean> {
    const params = {
      Destinations: recipients.map((recipient) => ({
        Destination: {
          ToAddresses: [recipient.address],
        },
        ReplacementTemplateData: JSON.stringify(recipient.replacementData),
      })),
      Source: this.appConfigService.awsSESConfig.sourceEmail,
      Template: templateName,
    };

    const command = new SendBulkTemplatedEmailCommand(params);

    try {
      const res = await this.ses.send(command);
      if (res.Status.some((status) => status.Error)) {
        console.log(
          'Error from SES:',
          res.Status.find((status) => status.Error).Error,
        );
        return false;
      }
    } catch (error) {
      console.log('Error sending emails', error);
    }

    console.log('Mail sent successfully');
    return true;
  }
}
