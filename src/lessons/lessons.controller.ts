import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { LessonsService } from './lessons.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/create-lesson.dto';
import { FileInterceptor } from '@nestjs/platform-express';
// import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import { LessonService } from './lesson.service';
// import { CreateLessonDto, UpdateLessonDto } from './lesson.dto';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonService: LessonsService) { }

  // @Post()
  // @UseGuards(JwtAuthGuard)
  // create(@Body() createLessonDto: CreateLessonDto, @Req() req) {
  //   return this.lessonService.create(createLessonDto, req.user);
  // }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('videoFile'))
  create(
    @UploadedFile() videoFile: Express.Multer.File,
    @Body() createLessonDto: CreateLessonDto,
    @Req() req
  ) {
    return this.lessonService.create({
      ...createLessonDto,
      videoFile,
    }, req.user);
  }

  // @Put(':id')
  // @UseGuards(JwtAuthGuard)
  // update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto, @Req() req) {
  //   return this.lessonService.update(id, updateLessonDto, req.user.id);
  // }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('videoFile'))
  update(
    @Param('id') id: string,
    @UploadedFile() videoFile: Express.Multer.File,
    @Body() updateLessonDto: UpdateLessonDto,
    @Req() req
  ) {
    return this.lessonService.update(id, {
      ...updateLessonDto,
      videoFile,
    }, req.user.id);
  }



  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req) {
    return this.lessonService.remove(id, req.user.id);
  }
}