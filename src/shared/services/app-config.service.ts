import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SqsConsumerOptions,
  SqsProducerOptions,
} from '@ssut/nestjs-sqs/dist/sqs.types';
import { isNil } from 'lodash';
import { QueueNames } from '../../common/constants/queue-names';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  public getNumber(key: string): number {
    const value = this.get(key);

    try {
      return Number(value);
    } catch {
      throw new Error(key + ' environment variable is not a number');
    }
  }

  public getBoolean(key: string): boolean {
    const value = this.get(key);

    return value === 'true' || key === '1';
  }

  public getString(key: string): string {
    const value = this.get(key);

    return value?.replace(/\\n/g, '\n');
  }

  get nodeEnv(): string {
    return this.getString('app.environment');
  }

  get defaultAdminPassword(): string {
    return this.getString('ADMIN_USER_DEFAULT_PASSWORD');
  }

  get awsS3Config(): {
    accessKeyId: string;
    secretAccessKey: string;
    bucketRegion: string;
    bucketName: string;
  } {
    return {
      accessKeyId: this.getString('AWS_S3_ACCESS_KEY_ID'),
      secretAccessKey: this.getString('AWS_S3_SECRET_ACCESS_KEY'),
      bucketRegion: this.getString('AWS_S3_BUCKET_REGION'),
      bucketName: this.getString('AWS_S3_BUCKET_NAME'),
    };
  }

  get awsSESConfig(): {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    sourceEmail: string;
    examStartRemindTemplateName: string;
  } {
    return {
      accessKeyId: this.getString('AWS_SES_ACCESS_KEY_ID'),
      secretAccessKey: this.getString('AWS_SES_SECRET_ACCESS_KEY'),
      region: this.getString('AWS_SES_REGION'),
      sourceEmail: this.getString('AWS_SES_SOURCE_EMAIL'),
      examStartRemindTemplateName: this.getString(
        'AWS_SES_EXAM_START_REMIND_TEMPLATE_NAME',
      ),
    };
  }

  get sqsProducersConfig(): SqsProducerOptions[] {
    return [
      {
        name: QueueNames.MAIL_SEND_QUEUE,
        queueUrl: this.getString('AWS_SQS_MAIL_QUEUE_URL'),
      },
    ];
  }

  get sqsConsumersConfig(): SqsConsumerOptions[] {
    return [
      {
        name: QueueNames.MAIL_SEND_QUEUE,
        queueUrl: this.getString('AWS_SQS_MAIL_QUEUE_URL'),
      },
    ];
  }

  get upgradeVipUserFee(): number {
    return 50000;
  }

  get vnpayConfig(): {
    tmnCode: string;
    hashSecret: string;
    vnpayUrl: string;
    returnUrl: string;
    ipnUrl: string;
    paymentUrlExpiresInMins: number;
  } {
    return {
      vnpayUrl: this.getString('VNPAY_URL'),
      tmnCode: this.getString('VNPAY_TMN_CODE'),
      hashSecret: this.getString('VNPAY_HASH_SECRET'),
      returnUrl: this.getString('VNPAY_RETURN_URL'),
      ipnUrl: this.getString('VNPAY_IPN_URL'),
      paymentUrlExpiresInMins: 10,
    };
  }

  get awsSQSConfig(): {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    mailQueueName: string;
    mailQueueUrl: string;
  } {
    return {
      accessKeyId: this.getString('AWS_SQS_ACCESS_KEY_ID'),
      secretAccessKey: this.getString('AWS_SQS_SECRET_ACCESS_KEY'),
      region: this.getString('AWS_SQS_REGION'),
      mailQueueName: this.getString('AWS_SQS_MAIL_QUEUE_NAME'),
      mailQueueUrl: this.getString('AWS_SQS_MAIL_QUEUE_URL'),
    };
  }

  get apiClientBaseUrl(): string {
    return this.getString('API_CLIENT_BASE_URL') || 'http://localhost:3000';
  }

  get jwtConfig(): {
    secret: string;
    accessTokenExpiresIn: number;
    refreshTokenExpiresIn: number;
  } {
    return {
      secret: this.getString('JWT_SECRET'),
      accessTokenExpiresIn: this.getNumber('JWT_ACCESS_TOKEN_EXPIRES_IN'),
      refreshTokenExpiresIn: this.getNumber('JWT_REFRESH_TOKEN_EXPIRES_IN'),
    };
  }

  get googleOAuthConfig(): {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope: string[];
  } {
    return {
      clientID: this.getString('GOOGLE_OAUTH_CLIENT_ID'),
      clientSecret: this.getString('GOOGLE_OAUTH_CLIENT_SECRET'),
      callbackURL: this.getString('GOOGLE_OAUTH_REDIRECT_URL'),
      scope: ['email', 'profile'],
    };
  }

  get documentationEnabled(): boolean {
    return this.getBoolean('app.enableDocumentation');
  }

  get port(): number {
    return this.getNumber('app.port');
  }

  get authConfig(): {
    jwtSecret: string;
    jwtExpirationTime: number;
    // jwtRefreshTokenSecret: string;
    // jwtRefreshTokenExpirationTime: number;
  } {
    return {
      jwtSecret: this.getString('auth.jwt.secret'),
      jwtExpirationTime: this.getNumber('auth.jwt.accessTokenExpiresInSec'),
      // jwtRefreshTokenSecret: this.getString('JWT_ACCESS_TOKEN_SECRET_KEY'),
      // jwtRefreshTokenExpirationTime: this.getNumber(
      //   'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      // ),
    };
  }

  get appConfig(): Record<string, any> {
    return {
      port: this.getNumber('app.port'),
      environent: this.getString('app.environment'),
      enableDocumentation: this.getBoolean('app.enableDocumentation'),
      tmpUploadDir: this.getString('app.tmpUploadDir'),
    };
  }

  public get(key: string): string {
    const value = this.configService.get<string>(key);

    if (isNil(value)) {
      throw new Error(key + ' environment variable does not set'); // probably we should call process.exit() too to avoid locking the service
    }

    return value;
  }
}
