import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLessonDto } from 'src/lessons/dto/create-lesson.dto';
import { UpdateLessonDto } from 'src/lessons/dto/update-lesson.dto';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { Purchase } from 'src/purchases/entities/purchase.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Lesson)
    private lessonsRepository: Repository<Lesson>,
    @InjectRepository(Purchase)
    private purchasesRepository: Repository<Purchase>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }


  // async getLessonsByTeacher(teacherId: string) {
  //   console.log('TeacherService.getLessonsByTeacher called with teacherId:', teacherId);
  //   const lessons = await this.lessonsRepository.find({
  //     where: { teacher: { id: teacherId } },
  //     relations: ['teacher'],
  //     order: { createdAt: 'DESC' },
  //   });

  //   console.log('Fetched lessons:', lessons.map(l => l.id));

  //   // Map into frontend-friendly shape
  //   return lessons.map(l => ({
  //     ...l,
  //     teacherId: l.teacher.id,
  //     teacherName: l.teacher.name,
  //   }));
  // }


  // src/teacher/teacher.service.ts

  async getLessonsByTeacher(teacherId: string) {
    // This QueryBuilder is more explicit and ensures all columns are selected.
    const lessons = await this.lessonsRepository
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.teacher', 'teacher')
      .where('lesson.teacherId = :teacherId', { teacherId })
      .orderBy('lesson.createdAt', 'DESC')
      .getMany();

    // This log will now show the raw lesson data, including salesCount
    console.log('Raw lessons fetched from DB with QueryBuilder:', lessons);

    // This mapping logic remains the same
    return lessons.map(l => ({
      ...l,
      teacherId: l.teacher.id,
      teacherName: l.teacher.name,
    }));
  }



  async getTeacherEarnings(teacherId: string) {
    const purchases = await this.purchasesRepository
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.lesson', 'lesson')
      .leftJoinAndSelect('lesson.teacher', 'teacher')
      .where('teacher.id = :teacherId', { teacherId })
      .getMany();

    const totalEarnings = purchases.reduce((sum, purchase) => sum + Number(purchase.amount), 0);

    return {
      totalEarnings,
      lessonsSold: purchases.length,
      purchases,
    };
  }



  async createLesson(teacherId: string, createLessonDto: CreateLessonDto) {
    const teacher = await this.usersRepository.findOneBy({ id: teacherId });

    if (!teacher) {
      throw new Error(`Teacher with ID ${teacherId} not found`);
    }

    const lesson = this.lessonsRepository.create({
      ...createLessonDto,
      teacher,
    });

    const savedLesson = await this.lessonsRepository.save(lesson);

    // Return mapped shape
    return {
      ...savedLesson,
      teacherId: teacher.id,
      teacherName: teacher.name,
    };
  }
  // async createLesson(teacherId: string, createLessonDto: CreateLessonDto) {
  //   const teacher = await this.usersRepository.findOneBy({ id: teacherId });

  //   if (!teacher) {
  //     throw new Error(`Teacher with ID ${teacherId} not found`);
  //   }

  //   const lesson = this.lessonsRepository.create({
  //     ...createLessonDto,
  //     teacher
  //   });

  //   return this.lessonsRepository.save(lesson);
  // }

  async updateLesson(teacherId: string, id: string, updateLessonDto: UpdateLessonDto) {
    await this.lessonsRepository.update(
      { id, teacher: { id: teacherId } },
      updateLessonDto
    );
    return this.lessonsRepository.findOne({
      where: { id },
      relations: ['teacher'] // Include teacher in the returned result
    });
  }

  async deleteLesson(teacherId: string, id: string) {
    return this.lessonsRepository.delete({ id, teacher: { id: teacherId } });
  }

  // async getLessonStudents(teacherId: string, lessonId: string) {
  //   const purchases = await this.purchasesRepository.find({
  //     where: {
  //       lesson: {
  //         id: lessonId,
  //         teacher: { id: teacherId }
  //       }
  //     },
  //     relations: ['student', 'lesson.teacher'],
  //   });

  //   return purchases.map(p => ({
  //     id: p.student.id,
  //     name: p.student.name,
  //     email: p.student.email,
  //     purchasedAt: p.createdAt,
  //   }));
  // }

  async getLessonStudents(teacherId: string, lessonId: string) {
    const purchases = await this.purchasesRepository.find({
      where: {
        lesson: {
          id: lessonId,
          teacher: { id: teacherId }
        }
      },
      relations: ['student', 'lesson.teacher'],
    });

    // ADD THIS DEBUG LOG:
    console.log(`Lesson ${lessonId} students - Found: ${purchases.length} purchases`);

    return purchases.map(p => ({
      id: p.student.id,
      name: p.student.name,
      email: p.student.email,
      purchasedAt: p.createdAt,
    }));
  }

  // src/teacher/teacher.service.ts
  // async getTeacherStats(teacherId: string) {
  //   const purchases = await this.purchasesRepository
  //     .createQueryBuilder('purchase')
  //     .leftJoinAndSelect('purchase.lesson', 'lesson')
  //     .where('lesson.teacherId = :teacherId', { teacherId })
  //     .getMany();

  //   const totalEarnings = purchases.reduce((sum, p) => sum + p.amount, 0);

  //   return {
  //     totalLessonsSold: purchases.length,
  //     totalSales: purchases.length, // Same unless you have bundles
  //     totalEarnings: Number(totalEarnings)
  //   };
  // }
  // src/teacher/teacher.service.ts

  async getTeacherStats(teacherId: string) {
    // This query is more efficient and reliable
    const stats = await this.purchasesRepository
      .createQueryBuilder('purchase')
      .leftJoin('purchase.lesson', 'lesson')
      .select('COUNT(purchase.id)', 'totalSales')
      .addSelect('SUM(purchase.amount)', 'totalEarnings')
      .where('lesson.teacherId = :teacherId', { teacherId })
      .getRawOne();

    // The result from getRawOne will have keys like 'totalsales' and 'totalearnings'
    // We convert them to numbers and provide defaults.
    const totalSales = Number(stats?.totalSales || 0);
    const totalEarnings = Number(stats?.totalEarnings || 0);

    console.log(`Teacher ${teacherId} stats - Sales: ${totalSales}, Earnings: ${totalEarnings}`);

    return {
      totalLessonsSold: totalSales, // Assuming one lesson per purchase
      totalSales: totalSales,
      totalEarnings: totalEarnings,
    };
  }
  // async getTeacherStats(teacherId: string) {
  //   const purchases = await this.purchasesRepository
  //     .createQueryBuilder('purchase')
  //     .leftJoinAndSelect('purchase.lesson', 'lesson')
  //     .where('lesson.teacherId = :teacherId', { teacherId })
  //     .getMany();

  //   const totalEarnings = purchases.reduce((sum, p) => sum + p.amount, 0);

  //   // ADD THIS DEBUG LOG:
  //   console.log(`Teacher ${teacherId} stats - Purchases: ${purchases.length}, Earnings: ${totalEarnings}`);

  //   return {
  //     totalLessonsSold: purchases.length,
  //     totalSales: purchases.length,
  //     totalEarnings: Number(totalEarnings)

  //   };
  // }

  // async getLessonStudents(teacherId: string, lessonId: string) {
  //     const purchases = await this.purchasesRepository.find({
  //         where: { 
  //             lesson: { id: lessonId, teacher: { id: teacherId } }
  //         },
  //         relations: ['user']
  //     });

  //     return purchases.map(p => ({
  //         id: p.user.id,
  //         name: p.user.name
  //     }));
  // }
}

// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { CreateLessonDto } from 'src/lessons/dto/create-lesson.dto';
// import { UpdateLessonDto } from 'src/lessons/dto/update-lesson.dto';
// import { Lesson } from 'src/lessons/entities/lesson.entity';
// import { Purchase } from 'src/purchases/entities/purchase.entity';
// import { User } from 'src/users/entities/user.entity';
// import { Repository } from 'typeorm';

// @Injectable()
// export class TeacherService {
//   constructor(
//     @InjectRepository(Lesson)
//     private lessonsRepository: Repository<Lesson>,
//     @InjectRepository(Purchase)
//     private purchasesRepository: Repository<Purchase>,
//     @InjectRepository(User)
//     private usersRepository: Repository<User>,
//   ) { }

//   async getLessonsByTeacher(teacherId: string) {
//     return this.lessonsRepository.find({
//       where: { teacher: { id: teacherId } },
//       order: { createdAt: 'DESC' },
//     });
//   }

//   async getTeacherEarnings(teacherId: string) {
//     const purchases = await this.purchasesRepository
//       .createQueryBuilder('purchase')
//       .leftJoinAndSelect('purchase.lesson', 'lesson')
//       .where('lesson.teacherId = :teacherId', { teacherId })
//       .getMany();

//     const totalEarnings = purchases.reduce((sum, purchase) => sum + Number(purchase.amount), 0);

//     return {
//       totalEarnings,
//       lessonsSold: purchases.length,
//       purchases,
//     };
//   }

//   async createLesson(teacherId: string, createLessonDto: CreateLessonDto) {
//     const teacher = await this.usersRepository.findOneBy({ id: teacherId });

//     if (!teacher) {
//       throw new Error(`Teacher with ID ${teacherId} not found`);
//     }

//     const lesson = this.lessonsRepository.create({
//       ...createLessonDto,
//       teacher: teacher,
//       teacherName: teacher.name,
//     });

//     return this.lessonsRepository.save(lesson);
//   }

//   async updateLesson(teacherId: string, id: string, updateLessonDto: UpdateLessonDto) {
//     await this.lessonsRepository.update({ id, teacher: { id: teacherId } }, updateLessonDto);
//     return this.lessonsRepository.findOneBy({ id });
//   }

//   async deleteLesson(teacherId: string, id: string) {
//     return this.lessonsRepository.delete({ id, teacher: { id: teacherId } });
//   }

//   async getLessonStudents(teacherId: string, lessonId: string) {
//     const purchases = await this.purchasesRepository.find({
//       where: { lessonId },
//       relations: ['student'],
//     });

//     return purchases.map(p => ({
//       id: p.student.id,
//       name: p.student.name,
//       email: p.student.email,
//       purchasedAt: p.createdAt,
//     }));
//   }
// }


// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { CreateLessonDto } from 'src/lessons/dto/create-lesson.dto';
// import { UpdateLessonDto } from 'src/lessons/dto/update-lesson.dto';
// import { Lesson } from 'src/lessons/entities/lesson.entity';
// import { Purchase } from 'src/purchases/entities/purchase.entity';
// import { User } from 'src/users/entities/user.entity';
// import { Repository } from 'typeorm';

// @Injectable()
// export class TeacherService {
//   constructor(
//     @InjectRepository(Lesson)
//     private lessonsRepository: Repository<Lesson>,
//     @InjectRepository(Purchase)
//     private purchasesRepository: Repository<Purchase>,
//     @InjectRepository(User)
//     private usersRepository: Repository<User>,
//   ) { }

//   async getLessonsByTeacher(teacherId: string) {
//     return this.lessonsRepository.find({
//       // Use the 'teacher' relationship to filter
//       where: { teacher: { id: teacherId } },
//       order: { createdAt: 'DESC' },
//     });
//   }

//   async getTeacherEarnings(teacherId: string) {
//     const purchases = await this.purchasesRepository
//       .createQueryBuilder('purchase')
//       .leftJoinAndSelect('purchase.lesson', 'lesson')
//       .where('lesson.teacherId = :teacherId', { teacherId })
//       .getMany();

//     const totalEarnings = purchases.reduce((sum, purchase) => sum + Number(purchase.amount), 0);

//     return {
//       totalEarnings,
//       lessonsSold: purchases.length,
//       purchases,
//     };
//   }

//   async createLesson(teacherId: string, createLessonDto: CreateLessonDto) {
//     const teacher = await this.usersRepository.findOneBy({ id: teacherId });

//     if (!teacher) {
//       throw new Error(`Teacher with ID ${teacherId} not found`);
//     }

//     const lesson = this.lessonsRepository.create({
//       ...createLessonDto,
//       // Assign both the relationship object AND the plain column value
//       teacher: teacher,
//       teacherName: teacher.name,
//     });

//     return this.lessonsRepository.save(lesson);
//   }

//   async updateLesson(teacherId: string, id: string, updateLessonDto: UpdateLessonDto) {
//     // Use the 'teacher' relationship to filter the update
//     await this.lessonsRepository.update({ id, teacher: { id: teacherId } }, updateLessonDto);
//     return this.lessonsRepository.findOneBy({ id });
//   }

//   async deleteLesson(teacherId: string, id: string) {
//     // Use the 'teacher' relationship to filter the deletion
//     return this.lessonsRepository.delete({ id, teacher: { id: teacherId } });
//   }

//   async getLessonStudents(teacherId: string, lessonId: string) {
//     const purchases = await this.purchasesRepository.find({
//       where: { lessonId },
//       relations: ['student'],
//     });

//     return purchases.map(p => ({
//       id: p.student.id,
//       name: p.student.name,
//       email: p.student.email,
//       purchasedAt: p.createdAt,
//     }));
//   }
// }


// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { CreateLessonDto } from 'src/lessons/dto/create-lesson.dto';
// import { UpdateLessonDto } from 'src/lessons/dto/update-lesson.dto';
// import { Lesson } from 'src/lessons/entities/lesson.entity';
// import { Purchase } from 'src/purchases/entities/purchase.entity';
// import { User } from 'src/users/entities/user.entity';
// import { Repository } from 'typeorm';

// @Injectable()
// export class TeacherService {
//   constructor(
//     @InjectRepository(Lesson)
//     private lessonsRepository: Repository<Lesson>,
//     @InjectRepository(Purchase)
//     private purchasesRepository: Repository<Purchase>,
//     @InjectRepository(User)
//     private usersRepository: Repository<User>,
//   ) { }

//   async getLessonsByTeacher(teacherId: string) {
//     return this.lessonsRepository.find({
//       where: { teacher: { id: teacherId } },
//       order: { createdAt: 'DESC' },
//     });
//   }

//   async getTeacherEarnings(teacherId: string) {
//     const purchases = await this.purchasesRepository
//       .createQueryBuilder('purchase')
//       .leftJoinAndSelect('purchase.lesson', 'lesson')
//       .where('lesson.teacherId = :teacherId', { teacherId })
//       .getMany();

//     const totalEarnings = purchases.reduce((sum, purchase) => sum + Number(purchase.amount), 0);

//     return {
//       totalEarnings,
//       lessonsSold: purchases.length,
//       purchases,
//     };
//   }

//   async createLesson(teacherId: string, createLessonDto: CreateLessonDto) {
//     const teacher = await this.usersRepository.findOneBy({ id: teacherId });

//     if (!teacher) {
//       throw new Error(`Teacher with ID ${teacherId} not found`);
//     }

//     const lesson = this.lessonsRepository.create({
//       ...createLessonDto,
//       teacher: teacher,
//     });

//     return this.lessonsRepository.save(lesson);
//   }

//   async updateLesson(teacherId: string, id: string, updateLessonDto: UpdateLessonDto) {
//     await this.lessonsRepository.update({ id, teacher: { id: teacherId } }, updateLessonDto);
//     return this.lessonsRepository.findOneBy({ id });
//   }

//   async deleteLesson(teacherId: string, id: string) {
//     return this.lessonsRepository.delete({ id, teacher: { id: teacherId } });
//   }

//   async getLessonStudents(teacherId: string, lessonId: string) {
//     const purchases = await this.purchasesRepository.find({
//       where: { lessonId },
//       relations: ['student'],
//     });

//     return purchases.map(p => ({
//       id: p.student.id,
//       name: p.student.name,
//       email: p.student.email,
//       purchasedAt: p.createdAt,
//     }));
//   }
// }

// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { CreateLessonDto } from 'src/lessons/dto/create-lesson.dto';
// import { UpdateLessonDto } from 'src/lessons/dto/update-lesson.dto';
// import { Lesson } from 'src/lessons/entities/lesson.entity';
// import { Purchase } from 'src/purchases/entities/purchase.entity';
// import { User } from 'src/users/entities/user.entity';
// import { Repository } from 'typeorm';
// // import { Lesson } from '../entities/lesson.entity';
// // import { Purchase } from '../entities/purchase.entity';
// // import { User } from '../entities/user.entity';

// @Injectable()
// export class TeacherService {
//   constructor(
//     @InjectRepository(Lesson)
//     private lessonsRepository: Repository<Lesson>,
//     @InjectRepository(Purchase)
//     private purchasesRepository: Repository<Purchase>,
//     @InjectRepository(User)
//     private usersRepository: Repository<User>,
//   ) { }

//   async getLessonsByTeacher(teacherId: string) {
//     return this.lessonsRepository.find({
//       where: { teacherId },
//       order: { createdAt: 'DESC' },
//     });
//   }

//    async getTeacherEarnings(teacherId: string) {
//     const purchases = await this.purchasesRepository
//       .createQueryBuilder('purchase')
//       .leftJoinAndSelect('purchase.lesson', 'lesson')
//       .where('lesson.teacherId = :teacherId', { teacherId })
//       .getMany();

//     const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.price, 0);

//     return {
//       totalEarnings,
//       lessonsSold: purchases.length,
//       purchases, // Optionally, return the list of purchases
//     };
//   }

//   // async createLesson(teacherId: string, createLessonDto: CreateLessonDto) {
//   //   const teacher = await this.usersRepository.findOneBy({ id: teacherId });
//   //   const lesson = this.lessonsRepository.create({
//   //     ...createLessonDto,
//   //     teacherId,
//   //     teacherName: teacher.name,
//   //   });
//   //   return this.lessonsRepository.save(lesson);
//   // }

//   async createLesson(teacherId: string, createLessonDto: CreateLessonDto) {
//     const teacher = await this.usersRepository.findOneBy({ id: teacherId });

//     if (!teacher) {
//       throw new Error(`Teacher with ID ${teacherId} not found`);
//     }

//     const lesson = this.lessonsRepository.create({
//       ...createLessonDto,
//       teacherId,

//     });

//     return this.lessonsRepository.save(lesson);
//   }


//   async updateLesson(teacherId: string, id: string, updateLessonDto: UpdateLessonDto) {
//     await this.lessonsRepository.update({ id, teacherId }, updateLessonDto);
//     return this.lessonsRepository.findOneBy({ id });
//   }

//   async deleteLesson(teacherId: string, id: string) {
//     return this.lessonsRepository.delete({ id, teacherId });
//   }

//   async getLessonStudents(teacherId: string, lessonId: string) {
//     const purchases = await this.purchasesRepository.find({
//       where: { lessonId },
//       relations: ['student'],
//     });

//     return purchases.map(p => ({
//       id: p.student.id,
//       name: p.student.name,
//       email: p.student.email,
//       purchasedAt: p.createdAt,
//     }));
//   }
// }