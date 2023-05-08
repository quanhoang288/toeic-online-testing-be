import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
export function setupSwagger(app: INestApplication, port: number): void {
  const options = new DocumentBuilder().setTitle('API').addBearerAuth().build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);

  console.info(`Documentation: http://localhost:${port}/api-docs`);
}
