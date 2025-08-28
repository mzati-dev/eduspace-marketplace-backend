// src/lessons/lessons.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { CreateLessonDto, UpdateLessonDto } from './dto/create-lesson.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
  ) { }

  async create(createLessonDto: CreateLessonDto, teacher: User) {
    let videoUrl = createLessonDto.videoUrl;

    // --- CHANGE IS HERE ---
    // This now checks that the file exists AND has a filename
    if (createLessonDto.videoFile && createLessonDto.videoFile.filename) {
      videoUrl = `uploads/videos/${createLessonDto.videoFile.filename}`;
    }

    const lesson = this.lessonRepository.create({
      ...createLessonDto,
      videoUrl,
      teacher,
    });

    const savedLesson = await this.lessonRepository.save(lesson);

    return {
      id: savedLesson.id,
      title: savedLesson.title,
      description: savedLesson.description,
      subject: savedLesson.subject,     // Add this line
      form: savedLesson.form,           // Add this line
      price: savedLesson.price,         // Add this line
      videoUrl: savedLesson.videoUrl,
      teacherId: teacher.id,
      teacherName: `${teacher.name}`,
    };
  }

  async update(id: string, updateLessonDto: UpdateLessonDto, teacherId: string) {
    const lesson = await this.lessonRepository.findOne({
      where: { id, teacher: { id: teacherId } },
      relations: ['teacher'],
    });
    if (!lesson) {
      throw new NotFoundException('Lesson not found or you are not the owner');
    }

    // --- CHANGE IS HERE ---
    // This now checks that the file exists AND has a filename
    if (updateLessonDto.videoFile && updateLessonDto.videoFile.filename) {
      // Note: We are assigning to a new property on the DTO here before merging.
      updateLessonDto.videoUrl = `uploads/videos/${updateLessonDto.videoFile.filename}`;
    }

    Object.assign(lesson, updateLessonDto);
    const updatedLesson = await this.lessonRepository.save(lesson);

    return {
      id: updatedLesson.id,
      title: updatedLesson.title,
      description: updatedLesson.description,
      subject: updatedLesson.subject,
      form: updatedLesson.form,
      price: updatedLesson.price,
      videoUrl: updatedLesson.videoUrl,
      teacherId: lesson.teacher.id,
      teacherName: `${lesson.teacher.name}`,
    };
  }

  async findOne(id: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({ where: { id } });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    return lesson;
  }

  async remove(id: string, teacherId: string): Promise<void> {
    const result = await this.lessonRepository.delete({ id, teacher: { id: teacherId } });
    if (result.affected === 0) {
      throw new NotFoundException('Lesson not found or you are not the owner');
    }
  }
}

// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Lesson } from './entities/lesson.entity';
// import { CreateLessonDto, UpdateLessonDto } from './dto/create-lesson.dto';
// import { User } from 'src/users/entities/user.entity';
// // import { Lesson } from './lesson.entity';
// // import { CreateLessonDto, UpdateLessonDto } from './lesson.dto';
// // import { User } from '../auth/user.entity';

// @Injectable()
// export class LessonsService {
//   constructor(
//     @InjectRepository(Lesson)
//     private lessonRepository: Repository<Lesson>,
//   ) { }

//   // async create(createLessonDto: CreateLessonDto, teacher: User): Promise<Lesson> {
//   //   const lesson = this.lessonRepository.create({
//   //     ...createLessonDto,
//   //     teacher,
//   //   });
//   //   return this.lessonRepository.save(lesson);
//   // }

//   // async create(createLessonDto: CreateLessonDto, teacher: User): Promise<Lesson> {
//   //   let videoUrl = createLessonDto.videoUrl;

//   //   if (createLessonDto.videoFile) {
//   //     // Save the file path or process the file as needed
//   //     videoUrl = `/uploads/videos/${createLessonDto.videoFile.filename}`;
//   //   }

//   //   const lesson = this.lessonRepository.create({
//   //     ...createLessonDto,
//   //     videoUrl,
//   //     teacher,
//   //   });

//   //   return this.lessonRepository.save(lesson);
//   // }

//   async create(createLessonDto: CreateLessonDto, teacher: User) {
//     let videoUrl = createLessonDto.videoUrl;

//     if (createLessonDto.videoFile) {
//       videoUrl = `/uploads/videos/${createLessonDto.videoFile.filename}`;
//     }

//     const lesson = this.lessonRepository.create({
//       ...createLessonDto,
//       videoUrl,
//       teacher,
//     });

//     const savedLesson = await this.lessonRepository.save(lesson);

//     return {
//       id: savedLesson.id,
//       title: savedLesson.title,
//       description: savedLesson.description,
//       videoUrl: savedLesson.videoUrl,
//       teacherId: teacher.id,
//       teacherName: `${teacher.name}`,
//     };
//   }


//   // async update(id: string, updateLessonDto: UpdateLessonDto, teacherId: string): Promise<Lesson> {
//   //   const lesson = await this.lessonRepository.findOne({ where: { id, teacher: { id: teacherId } } });
//   //   if (!lesson) {
//   //     throw new NotFoundException('Lesson not found or you are not the owner');
//   //   }
//   //   Object.assign(lesson, updateLessonDto);
//   //   return this.lessonRepository.save(lesson);
//   // }


//   async update(id: string, updateLessonDto: UpdateLessonDto, teacherId: string) {
//     const lesson = await this.lessonRepository.findOne({
//       where: { id, teacher: { id: teacherId } },
//       relations: ['teacher'], // make sure teacher is loaded
//     });
//     if (!lesson) {
//       throw new NotFoundException('Lesson not found or you are not the owner');
//     }

//     if (updateLessonDto.videoFile) {
//       updateLessonDto.videoUrl = `/uploads/videos/${updateLessonDto.videoFile.filename}`;
//     }

//     Object.assign(lesson, updateLessonDto);
//     const updatedLesson = await this.lessonRepository.save(lesson);

//     return {
//       id: updatedLesson.id,
//       title: updatedLesson.title,
//       description: updatedLesson.description,
//       videoUrl: updatedLesson.videoUrl,
//       teacherId: lesson.teacher.id,
//       teacherName: `${lesson.teacher.name}`,
//     };
//   }

//   // async update(id: string, updateLessonDto: UpdateLessonDto, teacherId: string): Promise<Lesson> {
//   //   const lesson = await this.lessonRepository.findOne({ where: { id, teacher: { id: teacherId } } });
//   //   if (!lesson) {
//   //     throw new NotFoundException('Lesson not found or you are not the owner');
//   //   }

//   //   if (updateLessonDto.videoFile) {
//   //     // Save the new file and update the URL
//   //     updateLessonDto.videoUrl = `/uploads/videos/${updateLessonDto.videoFile.filename}`;
//   //     // Optionally delete the old file here
//   //   }

//   //   Object.assign(lesson, updateLessonDto);
//   //   return this.lessonRepository.save(lesson);
//   // }



//   async findOne(id: string): Promise<Lesson> {
//     const lesson = await this.lessonRepository.findOne({ where: { id } });
//     if (!lesson) {
//       throw new NotFoundException('Lesson not found');
//     }
//     return lesson;
//   }

//   async remove(id: string, teacherId: string): Promise<void> {
//     const result = await this.lessonRepository.delete({ id, teacher: { id: teacherId } });
//     if (result.affected === 0) {
//       throw new NotFoundException('Lesson not found or you are not the owner');
//     }
//   }
// }