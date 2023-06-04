import { Injectable } from '@nestjs/common';

import { ExamTypeSeedService } from './services/exam-type-seed.service';
import { RoleSeedService } from './services/role-seed.service';
import { OAuthProviderSeedService } from './services/oauth-provider-seed.service';

@Injectable()
export class SeedsService {
  constructor(
    private examTypeSeedService: ExamTypeSeedService,
    private roleSeedService: RoleSeedService,
    private oauthProviderSeedService: OAuthProviderSeedService,
  ) {}

  async seed() {
    await this.examTypeSeedService.run();
    await this.roleSeedService.run();
    await this.oauthProviderSeedService.run();
  }
}
