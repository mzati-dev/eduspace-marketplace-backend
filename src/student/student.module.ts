// src/student/student.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Purchase } from '../purchases/entities/purchase.entity';
import { AuthModule } from '../auth/auth.module';  // <-- import AuthModule here
import { UsersModule } from 'src/users/users.module';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lesson, Purchase]),
    AuthModule,
    UsersModule,
  ],
  controllers: [StudentController],

  providers: [
    StudentService,

  ],
})
export class StudentModule { }
