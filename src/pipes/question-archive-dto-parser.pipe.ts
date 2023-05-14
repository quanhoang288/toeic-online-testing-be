import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { ExamDto } from '../modules/exam/dtos/exam.dto';
import _ from 'lodash';
import { QuestionArchiveDto } from '../modules/question-archive/dtos/question-archive.dto';

@Injectable()
export class QuestionArchiveDtoParser implements PipeTransform {
  transform(
    value: Record<string, unknown>,
    _metadata: ArgumentMetadata,
  ): Partial<ExamDto> {
    const transformedDto: Partial<QuestionArchiveDto> = { ...value };

    transformedDto.questions = _.isString(transformedDto.questions)
      ? JSON.parse(transformedDto.questions)
      : transformedDto.questions;

    transformedDto.questionSets = _.isString(transformedDto.questionSets)
      ? JSON.parse(transformedDto.questionSets)
      : transformedDto.questionSets;

    return transformedDto;
  }
}
