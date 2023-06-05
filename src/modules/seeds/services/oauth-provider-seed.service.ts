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
    console.log('running oauth provider seed');
    await Promise.all(
      oauthProviderData.map(async (oauthProvider) => {
        const existingProvider = await this.getRepository().findOneBy({
          name: oauthProvider.name,
        });
        if (!existingProvider) {
          await this.getRepository().save(oauthProvider);
        } else {
          await this.getRepository().update(
            { id: existingProvider.id },
            oauthProvider,
          );
        }
      }),
    );

    console.log('running oauth provider seed done');
    console.log('================================');
  }
}
