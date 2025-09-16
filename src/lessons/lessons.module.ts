import { forwardRef, Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { Purchase } from 'src/purchases/entities/purchase.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lesson, Purchase]),
    AuthModule, // ✅ Register repository here
    UsersModule,
    forwardRef(() => NotificationsModule),
  ],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService, TypeOrmModule],
})
export class LessonsModule { }
