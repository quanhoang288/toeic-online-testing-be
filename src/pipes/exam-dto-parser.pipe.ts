import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { ExamDto } from '../modules/exam/dtos/exam.dto';
import _ from 'lodash';

@Injectable()
export class ExamDtoParser implements PipeTransform {
  transform(
    value: Record<string, unknown>,
    _metadata: ArgumentMetadata,
  ): Partial<ExamDto> {
    const transformedDto: Partial<ExamDto> = { ...value };

    transformedDto.sections = _.isString(transformedDto.sections)
      ? JSON.parse(transformedDto.sections)
      : transformedDto.sections;

    return transformedDto;
  }
}
