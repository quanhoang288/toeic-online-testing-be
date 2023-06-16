import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { SQS } from 'aws-sdk';
import { SqsModule } from '@ssut/nestjs-sqs';

import { default as config } from './config';
import { SharedModule } from './shared/shared.module';
import { ExamStartRemindTask } from './schedule/exam-start-remind.task';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamEntity } from './database/entities/exam.entity';
import { ExamRegistrationEntity } from './database/entities/exam-registration.entity';
import { AppConfigService } from './shared/services/app-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      load: Object.values(config),
    }),
    SharedModule,
    SqsModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        producers: configService.sqsProducersConfig.map((config) => ({
          ...config,
          sqs: new SQS({
            region: configService.awsSQSConfig.region,
            credentials: {
              accessKeyId: configService.awsSQSConfig.accessKeyId,
              secretAccessKey: configService.awsSQSConfig.secretAccessKey,
            },
          }),
        })),
      }),
    }),
    TypeOrmModule.forFeature([ExamEntity, ExamRegistrationEntity]),
    NestScheduleModule.forRoot(),
  ],
  providers: [ExamStartRemindTask],
})
export class ScheduleModule {}
