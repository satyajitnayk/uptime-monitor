import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{ cors: true });

  app.useGlobalPipes(new ValidationPipe());
  // app.enableCors()
  const config = new DocumentBuilder()
    .setTitle('API Documentation For Uptime Monitor')
    .setDescription('Public apis available to use')
    .setVersion('1.0')
    .addTag('APIS')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000, () => console.log(`server running on port 3000`));
}
bootstrap();
