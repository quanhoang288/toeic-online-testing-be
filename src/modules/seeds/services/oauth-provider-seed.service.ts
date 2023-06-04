import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SeedBaseService } from './seed-base.service';

import oauthProviderData from '../data/oauth-provider.json';
import { OAuthProviderEntity } from '../../../database/entities/oauth-provider.entity';

@Injectable()
export class OAuthProviderSeedService extends SeedBaseService<OAuthProviderEntity> {
  constructor(
    @InjectRepository(OAuthProviderEntity)
    oauthProviderRepository: Repository<OAuthProviderEntity>,
  ) {
    super(oauthProviderRepository);
  }

  public async run(): Promise<void> {
    await this.getRepository().upsert(
      (oauthProviderData || []).map((oauthProvider) =>
        this.getRepository().create(oauthProvider),
      ),
      {
        conflictPaths: ['name'],
      },
    );
  }
}
