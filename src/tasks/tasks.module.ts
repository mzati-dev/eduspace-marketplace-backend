// src/tasks/tasks.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { Purchase } from 'src/purchases/entities/purchase.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { Rating } from 'src/ratings/entities/rating.entity'; // Assumes you have a Rating entity
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Purchase, Rating, User]), // Make repositories available
    NotificationsModule, // So we can use NotificationsService
  ],
  providers: [TasksService],
})
export class TasksModule { }