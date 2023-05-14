import { ApiProperty } from '@nestjs/swagger';
import { QuestionArchiveDto } from '../question-archive.dto';

export class QuestionArchiveUploadDto extends QuestionArchiveDto {
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  audios: any[];

  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  images: any[];
}
