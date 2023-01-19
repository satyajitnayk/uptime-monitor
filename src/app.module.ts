import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { UrlsModule } from './urls/urls.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';
@Module({
  imports: [UsersModule, UrlsModule, ScheduleModule.forRoot(), TasksModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
