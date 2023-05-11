import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { MulterModule } from '@nestjs/platform-express';
import { AppConfigService } from './services/app-config.service';
import { AwsS3Service } from './services/aws-s3.service';
import { GeneratorService } from './services/generator.service';
import path from 'path';
import multer from 'multer';
import { TransactionService } from './services/transaction.service';

const providers = [
  AppConfigService,
  AwsS3Service,
  GeneratorService,
  TransactionService,
];

@Global()
@Module({
  providers,
  imports: [
    DatabaseModule,
    MulterModule.registerAsync({
      useFactory: (configService: AppConfigService) => ({
        storage: multer.diskStorage({
          destination: configService.appConfig.tmpUploadDir,
          filename: (req, file, cb) => {
            return cb(
              null,
              `${
                path.basename(file.originalname).split('.')[0]
              }-${Date.now()}${path.extname(file.originalname)}`,
            );
          },
        }),
      }),
      inject: [AppConfigService],
    }),
  ],
  exports: [...providers, DatabaseModule, MulterModule],
})
export class SharedModule {}
