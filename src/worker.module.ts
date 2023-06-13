import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { default as config } from './config';
import { SqsModule } from '@ssut/nestjs-sqs';
import { AppConfigService } from './shared/services/app-config.service';
import { MailSendProcessor } from './modules/worker/mail-send.processor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      load: Object.values(config),
    }),
    SqsModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        consumers: [
          {
            name: configService.awsSQSConfig.mailQueueName,
            queueUrl: configService.awsSQSConfig.mailQueueUrl,
            region: configService.awsSQSConfig.region,
          },
        ],
      }),
    }),
  ],
  providers: [MailSendProcessor],
})
export class WorkerModule {}
