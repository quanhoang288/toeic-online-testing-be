import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { appConfig } from './config/app.config';

export function setupSwagger(app: INestApplication): void {
  const options = new DocumentBuilder().setTitle('API').addBearerAuth().build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);

  console.info(`Documentation: http://localhost:${appConfig.port}/api-docs`);
}
