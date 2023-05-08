import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import path from 'path';

@Injectable()
export class ImageFileValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const allowedFileTypes = /jpg|jpeg|png/;
    return allowedFileTypes.test(
      path.extname(value.originalname).toLowerCase(),
    );
  }
}
