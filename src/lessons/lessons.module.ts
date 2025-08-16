import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lesson]),
    AuthModule, // ✅ Register repository here
    UsersModule,
  ],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService, TypeOrmModule],
})
export class LessonsModule { }
