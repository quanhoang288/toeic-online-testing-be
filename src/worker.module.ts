import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SqsModule } from '@ssut/nestjs-sqs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { default as config } from './config';
import { AppConfigService } from './shared/services/app-config.service';
import { MailSendProcessor } from './modules/worker/mail-send.processor';
import { SharedModule } from './shared/shared.module';
import { ExamEntity } from './database/entities/exam.entity';
import { ExamRegistrationEntity } from './database/entities/exam-registration.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      load: Object.values(config),
    }),
    SharedModule,
    TypeOrmModule.forFeature([ExamEntity, ExamRegistrationEntity]),
    SqsModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        consumers: configService.sqsConsumersConfig,
      }),
    }),
  ],
  providers: [MailSendProcessor],
})
export class WorkerModule {}
