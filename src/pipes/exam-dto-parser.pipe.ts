import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ExamDto } from '../modules/exam/dtos/exam.dto';
import _ from 'lodash';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ExamDtoParser implements PipeTransform {
  async transform(
    value: Record<string, unknown>,
    _metadata: ArgumentMetadata,
  ): Promise<Partial<ExamDto>> {
    const transformedDto: Partial<ExamDto> = _.omitBy(
      { ...value },
      (val) =>
        val == null ||
        val == undefined ||
        val == 'null' ||
        val == 'undefined' ||
        _.isEmpty(val),
    );

    transformedDto.sections = _.isString(transformedDto.sections)
      ? JSON.parse(transformedDto.sections)
      : transformedDto.sections;

    const examPayload = plainToClass(ExamDto, transformedDto, {
      enableImplicitConversion: true,
    });
    const errors = await validate(examPayload);
    if (errors.length) {
      throw new UnprocessableEntityException(errors);
    }

    return examPayload;
  }
}
