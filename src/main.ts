import {
  HttpStatus,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { setupSwagger } from './setup-swagger';
import { SharedModule } from './shared/shared.module';
import { AppConfigService } from './shared/services/app-config.service';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { HttpExceptionFilter } from './filters/bad-request.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    { cors: true },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      dismissDefaultMessages: true,
      exceptionFactory: (errors) => new UnprocessableEntityException(errors),
    }),
  );

  const reflector = app.get(Reflector);

  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new HttpExceptionFilter(reflector),
  );

  app.setGlobalPrefix('api', { exclude: ['files'] });

  const configService = app.select(SharedModule).get(AppConfigService);

  const port = configService.appConfig.port;

  if (configService.documentationEnabled) {
    setupSwagger(app, port);
  }

  await app.listen(port);
}

void bootstrap();
