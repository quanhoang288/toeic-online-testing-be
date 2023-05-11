import { ApiProperty } from '@nestjs/swagger';
import { ExamDto } from '../exam.dto';

export class ExamUploadDto extends ExamDto {
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  audios: any[];

  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  images: any[];
}
