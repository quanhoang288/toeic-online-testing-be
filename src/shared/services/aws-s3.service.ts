import { Injectable } from '@nestjs/common';
import { GetObjectCommand, S3 } from '@aws-sdk/client-s3';
import * as fsPromises from 'fs/promises';

import { IFile } from '../../common/models/IFile';
import { AppConfigService } from './app-config.service';
import { Readable } from 'stream';

@Injectable()
export class AwsS3Service {
  private readonly s3: S3;

  constructor(public configService: AppConfigService) {
    const awsS3Config = configService.awsS3Config;

    this.s3 = new S3({
      credentials: {
        accessKeyId: awsS3Config.accessKeyId,
        secretAccessKey: awsS3Config.secretAccessKey,
      },
      region: awsS3Config.bucketRegion,
    });
  }

  async uploadFile(file: IFile, destFolder: string): Promise<string> {
    const blob = await fsPromises.readFile(file.path);
    const key = destFolder + '/' + file.filename;
    await this.s3.putObject({
      Bucket: this.configService.awsS3Config.bucketName,
      Body: blob,
      Key: key,
    });

    return key;
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3.deleteObject({
      Bucket: this.configService.awsS3Config.bucketName,
      Key: key,
    });
  }

  async getFileStream(key: string): Promise<Readable> {
    const command = new GetObjectCommand({
      Bucket: this.configService.awsS3Config.bucketName,
      Key: key,
    });
    const item = await this.s3.send(command);
    return item.Body as Readable;
  }
}
