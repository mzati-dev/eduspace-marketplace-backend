// // src/lessons/lessons.service.ts


import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Lesson, LessonStatus } from './entities/lesson.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { User } from 'src/users/entities/user.entity';
import { Purchase } from 'src/purchases/entities/purchase.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import axios from 'axios';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) { }

  // ==========================================
  // NEW: Get Upload Signature for Bunny.net
  // ==========================================
  async getUploadSignature(title: string) {
    const libraryId = process.env.BUNNY_LIBRARY_ID;
    const apiKey = process.env.BUNNY_API_KEY;

    if (!libraryId || !apiKey) {
      throw new Error('Bunny.net configuration missing in .env');
    }

    try {
      // 1. Tell Bunny to create a placeholder video
      const response = await axios.post(
        `https://video.bunnycdn.com/library/${libraryId}/videos`,
        { title: title || 'Untitled Lesson' },
        {
          headers: {
            AccessKey: apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      const videoId = response.data.guid;

      // 2. Return the details so Frontend can upload the file
      return {
        videoId: videoId,
        uploadUrl: `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
        authorizationSignature: apiKey,
      };
    } catch (error) {
      console.error('Bunny Auth Error:', error);
      throw new Error('Failed to communicate with Video Server');
    }
  }

  // ==========================================
  // EXISTING METHODS
  // ==========================================

  async create(createLessonDto: CreateLessonDto, teacher: User) {
    // We just take the 'videoId' that the Frontend sent us.
    const lesson = this.lessonRepository.create({
      ...createLessonDto,
      teacher,
      status: LessonStatus.PENDING,
    });

    const savedLesson = await this.lessonRepository.save(lesson);
    await this._notifyPreviousStudents(teacher, savedLesson);
    return savedLesson;
  }

  async findAll(options?: FindManyOptions<Lesson>): Promise<Lesson[]> {
    return this.lessonRepository.find({
      ...options,
      relations: ['teacher'],
    });
  }

  async findOne(id: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({ where: { id }, relations: ['teacher'] });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    return lesson;
  }

  async update(id: string, updateLessonDto: UpdateLessonDto, teacherId: string) {
    const lesson = await this.lessonRepository.findOne({
      where: { id, teacher: { id: teacherId } },
      relations: ['teacher'],
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found or you are not the owner');
    }

    Object.assign(lesson, updateLessonDto);

    if (lesson.status === LessonStatus.REJECTED) {
      lesson.status = LessonStatus.PENDING;
    }

    return await this.lessonRepository.save(lesson);
  }

  async remove(id: string, teacherId: string): Promise<void> {
    const result = await this.lessonRepository.delete({ id, teacher: { id: teacherId } });
    if (result.affected === 0) {
      throw new NotFoundException('Lesson not found or you are not the owner');
    }
  }

  // --- ADMIN FUNCTIONS ---

  async findPendingLessons(): Promise<Lesson[]> {
    return this.lessonRepository.find({
      where: { status: LessonStatus.PENDING },
      relations: ['teacher'],
      order: { createdAt: 'ASC' },
    });
  }

  async approveLesson(lessonId: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({ where: { id: lessonId }, relations: ['teacher'] });
    if (!lesson) throw new NotFoundException(`Lesson not found.`);

    lesson.status = LessonStatus.APPROVED;
    const approvedLesson = await this.lessonRepository.save(lesson);

    await this.notificationsService.create({
      userId: approvedLesson.teacher.id,
      type: 'LESSON_APPROVED',
      title: 'Your Lesson is Live!',
      description: `Your lesson, '${approvedLesson.title}', has been approved.`,
    });

    return approvedLesson;
  }

  async rejectLesson(lessonId: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({ where: { id: lessonId }, relations: ['teacher'] });
    if (!lesson) throw new NotFoundException(`Lesson not found.`);

    lesson.status = LessonStatus.REJECTED;
    const rejectedLesson = await this.lessonRepository.save(lesson);

    await this.notificationsService.create({
      userId: rejectedLesson.teacher.id,
      type: 'LESSON_REJECTED',
      title: 'Action Required',
      description: `Your lesson, '${rejectedLesson.title}', requires changes.`,
    });

    return rejectedLesson;
  }

  // --- HELPER ---
  private async _notifyPreviousStudents(teacher: User, newLesson: Lesson) {
    try {
      const pastPurchases = await this.purchaseRepository.createQueryBuilder('purchase')
        .select('DISTINCT purchase.studentId', 'studentId')
        .innerJoin('purchase.lesson', 'lesson')
        .where('lesson.teacherId = :teacherId', { teacherId: teacher.id })
        .andWhere('lesson.id != :newLessonId', { newLessonId: newLesson.id })
        .getRawMany();

      const studentIds = pastPurchases.map(p => p.studentId);
      if (studentIds.length === 0) return;

      const notifications = studentIds.map(studentId => ({
        userId: studentId,
        type: 'NEW_LESSON_FROM_TUTOR',
        title: `New Lesson from ${teacher.name}`,
        description: `${teacher.name} just published: '${newLesson.title}'.`,
      }));

      // Ensure your NotificationsService has a createMany method!
      // If not, use a loop (slower but works):
      for (const n of notifications) {
        await this.notificationsService.create(n);
      }

    } catch (error) {
      console.error(`Failed to notify students for lesson ${newLesson.id}:`, error);
    }
  }
}

// import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { FindManyOptions, Repository } from 'typeorm';
// import { Lesson, LessonStatus } from './entities/lesson.entity';
// import { CreateLessonDto, UpdateLessonDto } from './dto/create-lesson.dto';
// import { User } from 'src/users/entities/user.entity';
// import { Purchase } from 'src/purchases/entities/purchase.entity';
// import { NotificationsService } from 'src/notifications/notifications.service';

// @Injectable()
// export class LessonsService {
//   constructor(
//     @InjectRepository(Lesson)
//     private lessonRepository: Repository<Lesson>,
//     // This gives us access to the purchase history
//     @InjectRepository(Purchase)
//     private readonly purchaseRepository: Repository<Purchase>,
//     // This gives us access to the notification creation logic
//     @Inject(forwardRef(() => NotificationsService))
//     private readonly notificationsService: NotificationsService,
//   ) { }

//   async create(createLessonDto: CreateLessonDto, teacher: User) {
//     let videoUrl = createLessonDto.videoUrl;

//     // --- CHANGE IS HERE ---
//     // This now checks that the file exists AND has a filename
//     if (createLessonDto.videoFile && createLessonDto.videoFile.filename) {
//       videoUrl = `uploads/videos/${createLessonDto.videoFile.filename}`;
//     }

//     const lesson = this.lessonRepository.create({
//       ...createLessonDto,
//       videoUrl,
//       teacher,
//     });

//     const savedLesson = await this.lessonRepository.save(lesson);

//     // V V V V V ADD THIS LINE V V V V V
//     // After the lesson is successfully saved, call our new function to notify previous students.
//     // We run this in the background and don't wait for it to finish, so it doesn't slow down the response.
//     this._notifyPreviousStudents(teacher, savedLesson);
//     // ^ ^ ^ ^ ^ END OF THE NEW LINE ^ ^ ^ ^ ^


//     return {
//       id: savedLesson.id,
//       title: savedLesson.title,
//       description: savedLesson.description,
//       subject: savedLesson.subject,     // Add this line
//       form: savedLesson.form,           // Add this line
//       price: savedLesson.price,         // Add this line
//       videoUrl: savedLesson.videoUrl,
//       teacherId: teacher.id,
//       teacherName: `${teacher.name}`,
//     };
//   }

//   // --- 2. ADD THE 'findAll' METHOD FOR STUDENTS ---
//   /**
//    * Gets all lessons that are visible to the public (students).
//    * This now filters to only show lessons with an 'APPROVED' status.
//    */
//   // async findAll(): Promise<Lesson[]> {
//   //   return this.lessonRepository.find({
//   //     where: {
//   //       status: LessonStatus.APPROVED, // Only show approved lessons
//   //     },
//   //     relations: ['teacher'],
//   //   });
//   // }

//   // --- V V V V V THIS IS THE CORRECTED METHOD V V V V V ---
//   /**
//    * Finds lessons based on the provided options.
//    * This is used by both students (to find approved lessons) and admins.
//    */
//   async findAll(options?: FindManyOptions<Lesson>): Promise<Lesson[]> {
//     return this.lessonRepository.find({
//       ...options, // Spread the incoming options (like the 'where' clause)
//       relations: ['teacher'],
//     });
//   }
//   // --- ^ ^ ^ ^ ^ END OF THE CORRECTED METHOD ^ ^ ^ ^ ^ ---
//   // --- END OF 'findAll' METHOD ---

//   async update(id: string, updateLessonDto: UpdateLessonDto, teacherId: string) {
//     const lesson = await this.lessonRepository.findOne({
//       where: { id, teacher: { id: teacherId } },
//       relations: ['teacher'],
//     });
//     if (!lesson) {
//       throw new NotFoundException('Lesson not found or you are not the owner');
//     }

//     // --- CHANGE IS HERE ---
//     // This now checks that the file exists AND has a filename
//     if (updateLessonDto.videoFile && updateLessonDto.videoFile.filename) {
//       // Note: We are assigning to a new property on the DTO here before merging.
//       updateLessonDto.videoUrl = `uploads/videos/${updateLessonDto.videoFile.filename}`;
//     }

//     Object.assign(lesson, updateLessonDto);
//     const updatedLesson = await this.lessonRepository.save(lesson);

//     return {
//       id: updatedLesson.id,
//       title: updatedLesson.title,
//       description: updatedLesson.description,
//       subject: updatedLesson.subject,
//       form: updatedLesson.form,
//       price: updatedLesson.price,
//       videoUrl: updatedLesson.videoUrl,
//       teacherId: lesson.teacher.id,
//       teacherName: `${lesson.teacher.name}`,
//     };
//   }

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

//   // V V V V V 1. ADD THIS MISSING FUNCTION FOR ADMINS V V V V V
//   /**
//    * Gets all lessons that are awaiting admin review.
//    */
//   async findPendingLessons(): Promise<Lesson[]> {
//     return this.lessonRepository.find({
//       where: {
//         status: LessonStatus.PENDING,
//       },
//       relations: ['teacher'],
//       order: { createdAt: 'ASC' },
//     });
//   }
//   // ^ ^ ^ ^ ^ END OF THE FIRST MISSING FUNCTION ^ ^ ^ ^ ^

//   // V V V V V 2. ADD THIS SECOND MISSING FUNCTION FOR ADMINS V V V V V
//   /**
//    * Approves a lesson and notifies the teacher.
//    */
//   async approveLesson(lessonId: string): Promise<Lesson> {
//     const lesson = await this.lessonRepository.findOne({
//       where: { id: lessonId },
//       relations: ['teacher'],
//     });
//     if (!lesson) {
//       throw new NotFoundException(`Lesson with ID ${lessonId} not found.`);
//     }

//     lesson.status = LessonStatus.APPROVED;
//     const approvedLesson = await this.lessonRepository.save(lesson);

//     await this.notificationsService.create({
//       userId: approvedLesson.teacher.id,
//       type: 'LESSON_APPROVED',
//       title: 'Your Lesson is Live!',
//       description: `Your lesson, '${approvedLesson.title}', has been approved and is now available in the marketplace.`,
//     });

//     return approvedLesson;
//   }
//   // ^ ^ ^ ^ ^ END OF THE SECOND MISSING FUNCTION ^ ^ ^ ^ ^

//   // --- V V V V V ADD THE NEW REJECT FUNCTION HERE V V V V V ---
//   /**
//    * Rejects a lesson and notifies the teacher.
//    * (For Admin Use Only)
//    */
//   async rejectLesson(lessonId: string): Promise<Lesson> {
//     const lesson = await this.lessonRepository.findOne({
//       where: { id: lessonId },
//       relations: ['teacher'],
//     });
//     if (!lesson) {
//       throw new NotFoundException(`Lesson with ID ${lessonId} not found.`);
//     }

//     // Update status to 'rejected'
//     lesson.status = LessonStatus.REJECTED;
//     const rejectedLesson = await this.lessonRepository.save(lesson);

//     // Create and send a "Lesson Rejected" notification to the teacher.
//     await this.notificationsService.create({
//       userId: rejectedLesson.teacher.id,
//       type: 'LESSON_REJECTED',
//       title: 'Action Required for Your Lesson',
//       description: `Your lesson, '${rejectedLesson.title}', requires changes before it can be approved. Please review and update it.`,
//     });

//     return rejectedLesson;
//   }
//   // --- ^ ^ ^ ^ ^ END OF THE NEW REJECT FUNCTION ^ ^ ^ ^ ^ ---

//   // --- STEP 4: ADD THE NEW HELPER FUNCTION FOR NOTIFICATION LOGIC ---
//   private async _notifyPreviousStudents(teacher: User, newLesson: Lesson) {
//     try {
//       // Find all unique student IDs who have bought any lesson from this teacher before.
//       const pastPurchases = await this.purchaseRepository.createQueryBuilder('purchase')
//         .select('DISTINCT purchase.studentId', 'studentId')
//         .innerJoin('purchase.lesson', 'lesson')
//         .where('lesson.teacherId = :teacherId', { teacherId: teacher.id })
//         .andWhere('lesson.id != :newLessonId', { newLessonId: newLesson.id })
//         .getRawMany();

//       const studentIds = pastPurchases.map(p => p.studentId);
//       if (studentIds.length === 0) {
//         return; // No past students to notify
//       }

//       // Create a notification payload for each of those students.
//       const notifications = studentIds.map(studentId => ({
//         userId: studentId,
//         type: 'NEW_LESSON_FROM_TUTOR',
//         title: `New Lesson from ${teacher.name}`,
//         description: `${teacher.name} just published a new lesson you might like: '${newLesson.title}'.`,
//       }));

//       // Save all the new notifications to the database at once.
//       // NOTE: Make sure you have added the 'createMany' method to your NotificationsService.
//       await this.notificationsService.createMany(notifications);

//     } catch (error) {
//       // Log the error, but don't let it stop the main API response.
//       console.error(`Failed to send 'new lesson' notifications for lesson ${newLesson.id}:`, error);
//     }
//   }
//   // --- END OF STEP 4 ---
// }