import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from './shared/shared.module';
import { ExamModule } from './modules/exam/exam.module';
import { default as config } from './config';
import { FileModule } from './modules/file/file.module';
import { ExamSetModule } from './modules/exam-set/exam-set.module';
import { ExamTypeModule } from './modules/exam-type/exam-type.module';
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
    ExamSetModule,
    ExamTypeModule,
    FileModule,
  ],
})
export class AppModule {}
