import { Injectable } from '@nestjs/common';

import { ExamTypeSeedService } from './services/exam-type-seed.service';
import { RoleSeedService } from './services/role-seed.service';

@Injectable()
export class SeedsService {
  constructor(
    private examTypeSeedService: ExamTypeSeedService,
    private roleSeedService: RoleSeedService,
  ) {}

  async seed() {
    await this.examTypeSeedService.run();
    await this.roleSeedService.run();
  }
}
