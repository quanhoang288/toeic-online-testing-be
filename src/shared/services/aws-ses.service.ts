import { Injectable, Logger } from '@nestjs/common';
import { SESClient, SendBulkTemplatedEmailCommand } from '@aws-sdk/client-ses';

import { AppConfigService } from './app-config.service';

@Injectable()
export class AwsSESService {
  private ses: SESClient;
  private readonly logger = new Logger(AwsSESService.name);

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
    recipients: {
      address: string;
      replacementData: Record<string, unknown>;
    }[],
    templateName: string,
    defaultReplacementData: Record<string, unknown>,
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
      DefaultTemplateData: JSON.stringify(defaultReplacementData),
    };

    const command = new SendBulkTemplatedEmailCommand(params);

    try {
      const res = await this.ses.send(command);
      this.logger.log('Mail sending result:', res);
      if (res.Status.some((status) => status.Error)) {
        this.logger.error(
          'Error from SES:',
          res.Status.find((status) => status.Error).Error,
        );
        return false;
      }
    } catch (error) {
      this.logger.error(error);
      return false;
    }

    this.logger.log('Mail sent successfully');
    return true;
  }
}
