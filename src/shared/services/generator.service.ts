import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import { AppConfigService } from './app-config.service';

@Injectable()
export class GeneratorService {
  constructor(private readonly configService: AppConfigService) {}

  public uuid(): string {
    return uuid();
  }

  public fileName(ext: string): string {
    return this.uuid() + '.' + ext;
  }
}
