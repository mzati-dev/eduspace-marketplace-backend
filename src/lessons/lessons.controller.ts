import { Controller, Get, Post, Body, Param, Put, Delete, Req, UseGuards, Patch, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { LessonStatus } from './entities/lesson.entity';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonService: LessonsService) { }

  // --- NEW: UPLOAD AUTHORIZATION (Bunny.net) ---
  // This is the missing piece! It must be BEFORE :id routes.
  @Post('upload-auth')
  @UseGuards(JwtAuthGuard)
  getUploadAuth(@Body('filename') filename: string) {
    return this.lessonService.getUploadSignature(filename);
  }

  // --- 1. CREATE LESSON ---
  // The video was already uploaded to Bunny by the frontend.
  // We just receive the 'videoId' inside the Body here.
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createLessonDto: CreateLessonDto, @Req() req) {
    // req.user contains the teacher's info from the JWT token
    return this.lessonService.create(createLessonDto, req.user);
  }

  // --- 2. GET APPROVED LESSONS (For Students) ---
  @Get()
  findAll() {
    return this.lessonService.findAll({ where: { status: LessonStatus.APPROVED } });
  }

  // --- 3. GET PENDING LESSONS (For Admins) ---
  @Get('pending')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findPendingLessons() {
    return this.lessonService.findPendingLessons();
  }

  // --- 4. GET ONE LESSON ---
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonService.findOne(id);
  }

  // --- 5. UPDATE LESSON ---
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto, @Req() req) {
    return this.lessonService.update(id, updateLessonDto, req.user.id);
  }

  // --- 6. APPROVE LESSON (Admin) ---
  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  approveLesson(@Param('id') id: string) {
    return this.lessonService.approveLesson(id);
  }

  // --- 7. REJECT LESSON (Admin) ---
  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  rejectLesson(@Param('id') id: string) {
    return this.lessonService.rejectLesson(id);
  }

  // --- 8. DELETE LESSON ---
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req) {
    return this.lessonService.remove(id, req.user.id);
  }
}


// import { Controller, Get, Post, Body, Param, Put, Delete, Req, UseInterceptors, UploadedFile, Res, NotFoundException, UseGuards, Patch, HttpCode, HttpStatus } from '@nestjs/common';
// import { Response } from 'express';
// import { createReadStream, statSync } from 'fs';
// import { join } from 'path';
// import { LessonsService } from './lessons.service';
// import { CreateLessonDto, UpdateLessonDto } from './dto/create-lesson.dto';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import { multerOptions } from '../config/multer.config';
// import { AdminGuard } from 'src/auth/guards/admin.guard';
// import { LessonStatus } from './entities/lesson.entity';

// @Controller('lessons')
// export class LessonsController {
//   constructor(private readonly lessonService: LessonsService) { }

//   @Post()
//   @UseGuards(JwtAuthGuard)
//   @UseInterceptors(FileInterceptor('videoFile', multerOptions))
//   create(@UploadedFile() videoFile: Express.Multer.File, @Body() createLessonDto: CreateLessonDto, @Req() req) {
//     return this.lessonService.create({ ...createLessonDto, videoFile }, req.user);
//   }


//   // --- 2. ADD THE 'findAll' ENDPOINT FOR STUDENTS ---
//   /**
//    * This is the public endpoint for anyone (especially students)
//    * to get the list of all APPROVED lessons.
//    */
//   // @Get()
//   // findAll() {
//   //   return this.lessonService.findAll();
//   // }
//   @Get()
//   findAll() {
//     // 2. Add this filter to only return approved lessons
//     return this.lessonService.findAll({ where: { status: LessonStatus.APPROVED } });
//   }
//   // --- END OF 'findAll' ENDPOINT ---

//   // --- 3. ADD THE 'findPendingLessons' ENDPOINT FOR ADMINS ---
//   /**
//    * This is a protected endpoint for admins to get the list
//    * of lessons that are waiting for approval.
//    */
//   @Get('pending')
//   @UseGuards(JwtAuthGuard, AdminGuard) // This ensures only logged-in admins can access it
//   findPendingLessons() {
//     return this.lessonService.findPendingLessons();
//   }
//   // --- END OF 'findPendingLessons' ENDPOINT ---

//   @Put(':id')
//   @UseGuards(JwtAuthGuard)
//   @UseInterceptors(FileInterceptor('videoFile', multerOptions))
//   update(@Param('id') id: string, @UploadedFile() videoFile: Express.Multer.File, @Body() updateLessonDto: UpdateLessonDto, @Req() req) {
//     return this.lessonService.update(id, { ...updateLessonDto, videoFile }, req.user.id);
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.lessonService.findOne(id);
//   }

//   // THIS IS THE CORRECTED VIDEO STREAMING ROUTE
//   @Get(':id/video')
//   async streamVideo(@Param('id') id: string, @Res() res: Response) {
//     try {
//       const lesson = await this.lessonService.findOne(id);
//       if (!lesson || !lesson.videoUrl) {
//         throw new NotFoundException('Video for this lesson not found.');
//       }

//       // This path will now be joined correctly
//       const videoPath = join(process.cwd(), lesson.videoUrl);
//       console.log('Attempting to stream video from path:', videoPath);

//       // Check if file exists before creating stream
//       const stat = statSync(videoPath);

//       res.set({
//         'Content-Type': 'video/mp4',
//         'Content-Length': stat.size,
//       });

//       const file = createReadStream(videoPath);
//       file.pipe(res);

//     } catch (error) {
//       console.error('Error in streamVideo:', error);
//       if (error.code === 'ENOENT') {
//         throw new NotFoundException('Video file not found on server.');
//       }
//       throw error;
//     }
//   }

//   // --- 4. ADD THE 'approveLesson' ENDPOINT FOR ADMINS ---
//   /**
//    * This is a protected endpoint for an admin to approve a lesson.
//    * It changes the lesson's status from 'pending' to 'approved'.
//    */
//   @Patch(':id/approve')
//   @UseGuards(JwtAuthGuard, AdminGuard) // This ensures only logged-in admins can access it
//   @HttpCode(HttpStatus.OK)
//   approveLesson(@Param('id') id: string) {
//     return this.lessonService.approveLesson(id);
//   }
//   // --- END OF 'approveLesson' ENDPOINT ---

//   // --- V V V V V ADD THE NEW REJECT ENDPOINT HERE V V V V V ---
//   /**
//    * This is a protected endpoint for an admin to reject a lesson.
//    * It changes the lesson's status from 'pending' to 'rejected'.
//    */
//   @Patch(':id/reject')
//   @UseGuards(JwtAuthGuard, AdminGuard)
//   @HttpCode(HttpStatus.OK)
//   rejectLesson(@Param('id') id: string) {
//     return this.lessonService.rejectLesson(id);
//   }
//   // --- ^ ^ ^ ^ ^ END OF THE NEW REJECT ENDPOINT ^ ^ ^ ^ ^ ---

//   @Delete(':id')
//   @UseGuards(JwtAuthGuard)
//   remove(@Param('id') id: string, @Req() req) {
//     return this.lessonService.remove(id, req.user.id);
//   }
// }

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