import {
  Controller,
  Get,
  HttpStatus,
  Param,
  StreamableFile,
} from '@nestjs/common';
import { AwsS3Service } from '../../shared/services/aws-s3.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('files')
@ApiTags('files')
export class FileController {
  constructor(private readonly s3Service: AwsS3Service) {}

  @Get(':fileKey')
  @ApiResponse({ status: HttpStatus.PARTIAL_CONTENT })
  async getAudioStream(
    @Param('fileKey') fileKey: string,
  ): Promise<StreamableFile> {
    const fileStream = await this.s3Service.getFileStream(fileKey);
    return new StreamableFile(fileStream);
  }
}
