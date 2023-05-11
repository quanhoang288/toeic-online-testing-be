import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isNil } from 'lodash';

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
