import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { UrlsController } from './urls.controller';
import { UrlsService } from './urls.service';
import { AuthMiddleware } from '../auth.middleware';

@Module({
  controllers: [UrlsController],
  providers: [UrlsService, PrismaService, JwtService],
})
export class UrlsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('urls');
  }
}
