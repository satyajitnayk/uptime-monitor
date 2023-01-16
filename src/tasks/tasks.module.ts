import { Module } from '@nestjs/common';
import { UrlsService } from 'src/urls/urls.service';
import { PrismaService } from '../prisma.service';
import { TasksService } from './tasks.service';

@Module({
  controllers: [],
  providers: [PrismaService, UrlsService, TasksService],
})
export class TasksModule {}
