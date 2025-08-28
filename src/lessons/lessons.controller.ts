import { Controller, Get, Post, Body, Param, Put, Delete, Req, UseInterceptors, UploadedFile, Res, NotFoundException, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { createReadStream, statSync } from 'fs';
import { join } from 'path';
import { LessonsService } from './lessons.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/create-lesson.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { multerOptions } from '../config/multer.config';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonService: LessonsService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('videoFile', multerOptions))
  create(@UploadedFile() videoFile: Express.Multer.File, @Body() createLessonDto: CreateLessonDto, @Req() req) {
    return this.lessonService.create({ ...createLessonDto, videoFile }, req.user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('videoFile', multerOptions))
  update(@Param('id') id: string, @UploadedFile() videoFile: Express.Multer.File, @Body() updateLessonDto: UpdateLessonDto, @Req() req) {
    return this.lessonService.update(id, { ...updateLessonDto, videoFile }, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonService.findOne(id);
  }

  // THIS IS THE CORRECTED VIDEO STREAMING ROUTE
  @Get(':id/video')
  async streamVideo(@Param('id') id: string, @Res() res: Response) {
    try {
      const lesson = await this.lessonService.findOne(id);
      if (!lesson || !lesson.videoUrl) {
        throw new NotFoundException('Video for this lesson not found.');
      }

      // This path will now be joined correctly
      const videoPath = join(process.cwd(), lesson.videoUrl);
      console.log('Attempting to stream video from path:', videoPath);

      // Check if file exists before creating stream
      const stat = statSync(videoPath);

      res.set({
        'Content-Type': 'video/mp4',
        'Content-Length': stat.size,
      });

      const file = createReadStream(videoPath);
      file.pipe(res);

    } catch (error) {
      console.error('Error in streamVideo:', error);
      if (error.code === 'ENOENT') {
        throw new NotFoundException('Video file not found on server.');
      }
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req) {
    return this.lessonService.remove(id, req.user.id);
  }
}

// import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
// import { LessonsService } from './lessons.service';
// import { CreateLessonDto, UpdateLessonDto } from './dto/create-lesson.dto';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// // Import the new multerOptions
// import { multerOptions } from '../config/multer.config';

// @Controller('lessons')
// export class LessonsController {
//   constructor(private readonly lessonService: LessonsService) { }

//   @Post()
//   @UseGuards(JwtAuthGuard)
//   // Use the multerOptions directly in the FileInterceptor
//   @UseInterceptors(FileInterceptor('videoFile', multerOptions))
//   create(
//     @UploadedFile() videoFile: Express.Multer.File,
//     @Body() createLessonDto: CreateLessonDto,
//     @Req() req
//   ) {
//     // Add this log to check the file object again
//     console.log('--- FILE RECEIVED IN CONTROLLER ---', videoFile);

//     return this.lessonService.create({
//       ...createLessonDto,
//       videoFile,
//     }, req.user);
//   }

//   @Put(':id')
//   @UseGuards(JwtAuthGuard)
//   // Also apply it to the update route
//   @UseInterceptors(FileInterceptor('videoFile', multerOptions))
//   update(
//     @Param('id') id: string,
//     @UploadedFile() videoFile: Express.Multer.File,
//     @Body() updateLessonDto: UpdateLessonDto,
//     @Req() req
//   ) {
//     return this.lessonService.update(id, {
//       ...updateLessonDto,
//       videoFile,
//     }, req.user.id);
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.lessonService.findOne(id);
//   }

//   @Delete(':id')
//   @UseGuards(JwtAuthGuard)
//   remove(@Param('id') id: string, @Req() req) {
//     return this.lessonService.remove(id, req.user.id);
//   }
// }


// import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
// // import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import { LessonsService } from './lessons.service';
// import { CreateLessonDto, UpdateLessonDto } from './dto/create-lesson.dto';
// import { FileInterceptor } from '@nestjs/platform-express';
// // import { AuthGuard } from '@nestjs/passport';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// // import { LessonService } from './lesson.service';
// // import { CreateLessonDto, UpdateLessonDto } from './lesson.dto';
// // import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// @Controller('lessons')
// export class LessonsController {
//   constructor(private readonly lessonService: LessonsService) { }

//   // @Post()
//   // @UseGuards(JwtAuthGuard)
//   // create(@Body() createLessonDto: CreateLessonDto, @Req() req) {
//   //   return this.lessonService.create(createLessonDto, req.user);
//   // }

//   @Post()
//   @UseGuards(JwtAuthGuard)
//   @UseInterceptors(FileInterceptor('videoFile'))
//   create(
//     @UploadedFile() videoFile: Express.Multer.File,
//     @Body() createLessonDto: CreateLessonDto,
//     @Req() req
//   ) {

//     // --- DEBUGGING LINES ---
//     console.log('--- RECEIVED FILE ---');
//     console.log(videoFile);

//     console.log('--- RECEIVED BODY ---');
//     console.log(createLessonDto);
//     // --- END DEBUGGING ---
//     return this.lessonService.create({
//       ...createLessonDto,
//       videoFile,
//     }, req.user);
//   }

//   // @Put(':id')
//   // @UseGuards(JwtAuthGuard)
//   // update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto, @Req() req) {
//   //   return this.lessonService.update(id, updateLessonDto, req.user.id);
//   // }

//   @Put(':id')
//   @UseGuards(JwtAuthGuard)
//   @UseInterceptors(FileInterceptor('videoFile'))
//   update(
//     @Param('id') id: string,
//     @UploadedFile() videoFile: Express.Multer.File,
//     @Body() updateLessonDto: UpdateLessonDto,
//     @Req() req
//   ) {
//     return this.lessonService.update(id, {
//       ...updateLessonDto,
//       videoFile,
//     }, req.user.id);
//   }



//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.lessonService.findOne(id);
//   }

//   @Delete(':id')
//   @UseGuards(JwtAuthGuard)
//   remove(@Param('id') id: string, @Req() req) {
//     return this.lessonService.remove(id, req.user.id);
//   }
// }