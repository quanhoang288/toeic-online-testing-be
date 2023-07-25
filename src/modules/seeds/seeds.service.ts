import { Injectable } from '@nestjs/common';

import { ExamTypeSeedService } from './services/exam-type-seed.service';
import { RoleSeedService } from './services/role-seed.service';
import { OAuthProviderSeedService } from './services/oauth-provider-seed.service';
import { AdminSeedService } from './services/admin-seed.service';
import { ExamSeedService } from './services/exam-seed.service';

@Injectable()
export class SeedsService {
  constructor(
    private adminSeedService: AdminSeedService,
    private examTypeSeedService: ExamTypeSeedService,
    private roleSeedService: RoleSeedService,
    private oauthProviderSeedService: OAuthProviderSeedService,
    private examSeedService: ExamSeedService,
  ) {}

  async seed() {
    await this.examTypeSeedService.run();
    await this.roleSeedService.run();
    await this.oauthProviderSeedService.run();
    await this.adminSeedService.run();
    await this.examSeedService.run();
  }
}
