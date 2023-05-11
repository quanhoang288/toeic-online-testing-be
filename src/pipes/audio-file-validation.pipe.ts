import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import path from 'path';

@Injectable()
export class AudioFileValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const allowedFileTypes = /mp3|wav/;
    return allowedFileTypes.test(
      path.extname(value.originalname).toLowerCase(),
    );
  }
}
