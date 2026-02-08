import { Controller, Get, Post, Put, Delete, UseGuards, Req, Body, Param } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
import { TeacherService } from './teacher.service';
import { CreateLessonDto } from '../lessons/dto/create-lesson.dto';
import { UpdateLessonDto } from '../lessons/dto/update-lesson.dto';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';

@Controller('teacher')

// Apply both guards, starting with the JWT guard
@UseGuards(JwtAuthGuard, RolesGuard)
// Now, protect the controller with the @Roles decorator
@Roles(UserRole.TEACHER)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) { }

  // @Get('lessons')
  // async getTeacherLessons(@Req() req) {
  //   console.log('TeacherController.getTeacherLessons called for user:', req.user?.id);
  //   return this.teacherService.getLessonsByTeacher(req.user.id);
  // }

  @Get('lessons')
  async getTeacherLessons(@Req() req) {
    console.log('TeacherController.getTeacherLessons called for user:', req.user?.id);

    // Call the service
    const lessons = await this.teacherService.getLessonsByTeacher(req.user.id);

    // Now you can log the fetched lessons
    console.log('Fetched lessons:', lessons.map(l => l.id));

    return lessons;
  }


  @Get('earnings')
  async getTeacherEarnings(@Req() req) {
    // This is the new route you need to add.
    // It will call a new method in your TeacherService to get earnings data.
    return this.teacherService.getTeacherEarnings(req.user.id);
  }

  @Post('lessons')
  async createLesson(@Req() req, @Body() createLessonDto: CreateLessonDto) {
    const teacherId = req.user.id;
    return this.teacherService.createLesson(teacherId, createLessonDto);
  }

  @Put('lessons/:id')
  async updateLesson(
    @Req() req,
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto
  ) {
    return this.teacherService.updateLesson(req.user.id, id, updateLessonDto);
  }

  @Delete('lessons/:id')
  async deleteLesson(@Req() req, @Param('id') id: string) {
    return this.teacherService.deleteLesson(req.user.id, id);
  }

  @Get('lessons/:id/students')
  async getLessonStudents(@Req() req, @Param('id') id: string) {
    return this.teacherService.getLessonStudents(req.user.id, id);
  }

  // src/teacher/teacher.controller.ts
  @Get('stats')
  async getStats(@Req() req: any) {
    return this.teacherService.getTeacherStats(req.user.id);
  }



}