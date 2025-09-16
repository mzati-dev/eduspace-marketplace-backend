import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { Rating } from '../entities/rating.entity';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { Rating } from './entities/rating.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { User } from 'src/users/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
// import { Lesson } from '../entities/lesson.entity';     // For LessonRepository
// import { User } from '../entities/user.entity';         // For UserRepository

@Module({
  imports: [
    TypeOrmModule.forFeature([Rating, Lesson, User]),
    AuthModule,
    UsersModule,
    forwardRef(() => NotificationsModule),
  ],
  providers: [RatingsService],
  controllers: [RatingsController],
  exports: [RatingsService],
})
export class RatingsModule { }
