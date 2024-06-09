import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('Server');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: false,
  });
  app.use('/storage', express.static(join(__dirname, '..', 'storage')));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.setGlobalPrefix('api');
  const options = new DocumentBuilder()
    .setTitle('YouApp')
    .setDescription('YouApp API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000, () => {
    logger.log(`Running on port: ${3000}`);
  });
}
bootstrap();
