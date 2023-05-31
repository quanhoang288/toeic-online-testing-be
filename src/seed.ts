import { NestFactory } from '@nestjs/core';

import { SeedsModule } from './modules/seeds/seeds.module';
import { SeedsService } from './modules/seeds/seeds.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedsModule);
  const seedService = app.get(SeedsService);
  await seedService.seed();
  await app.close();
}

bootstrap();
