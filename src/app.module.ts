import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from './shared/shared.module';
import { ExamModule } from './modules/exam/exam.module';
import { default as config } from './config';
// import { SqsModule } from '@ssut/nestjs-sqs';
// import { AppConfigService } from './shared/services/app-config.service';

@Module({
  imports: [
    SharedModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      load: Object.values(config),
    }),
    // SqsModule.registerAsync({
    //   inject: [AppConfigService],
    //   useFactory: (configService: AppConfigService) => ({
    //     producers: configService.sqsProducersConfig,
    //   }),
    // }),
    ExamModule,
  ],
})
export class AppModule {}
