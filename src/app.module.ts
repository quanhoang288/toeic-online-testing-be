import {
  DynamicModule,
  ForwardReference,
  Module,
  Provider,
  Type,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SharedModule } from './shared/shared.module';
import { ExamModule } from './modules/exam/exam.module';
import { default as config } from './config';
import { FileModule } from './modules/file/file.module';
import { ExamSetModule } from './modules/exam-set/exam-set.module';
import { ExamTypeModule } from './modules/exam-type/exam-type.module';
import { QuestionArchiveModule } from './modules/question-archive/question-archive.module';
import { GradingModule } from './modules/grading/grading.module';
import { AuthModule } from './modules/auth/auth.module';
import { PaymentModule } from './modules/payment/payment.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    SharedModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      load: Object.values(config),
    }),
    AuthModule,
    ExamModule,
    QuestionArchiveModule,
    ExamSetModule,
    ExamTypeModule,
    FileModule,
    GradingModule,
    PaymentModule,
    UserModule,
  ],
})
export class AppModule {
  static extend(extend: {
    imports?: Array<
      Type | DynamicModule | Promise<DynamicModule> | ForwardReference
    >;
    providers?: Provider[];
  }): DynamicModule {
    return {
      module: AppModule,
      imports: extend.imports,
      providers: extend.providers,
      exports: extend.providers,
    };
  }
}
