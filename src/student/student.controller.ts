// src/student/student.controller.ts
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StudentService } from './student.service';
import { User } from '../users/entities/user.entity';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
// import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('student')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) { }

  // @Get('lessons')
  // async getAvailableLessons() {
  //   return this.studentService.getAvailableLessons();
  // }

  @Get('lessons')
  async getAvailableLessons() {
    // This will now return lessons with teacherName included
    return this.studentService.getAvailableLessons();
  }

  @Get('purchases')
  async getPurchasedLessons(@GetUser() user: User) {
    return this.studentService.getPurchasedLessons(user.id);
  }

  @Post('purchases')
  async purchaseLessons(
    @Body() body: { items: { lessonId: string }[] },
    @GetUser() user: User
  ) {
    return this.studentService.purchaseLessons(user.id, body.items);
  }
}