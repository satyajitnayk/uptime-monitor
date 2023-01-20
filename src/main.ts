import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    allowedHeaders: ['content-type'],
    origin: ['https://satyajitnayk.github.io'],
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle('API Documentation For Uptime Monitor')
    .setDescription('Public apis available to use')
    .setVersion('1.0')
    .addTag('APIS')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
