// src/student/student.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Purchase } from '../purchases/entities/purchase.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Lesson)
    private lessonsRepository: Repository<Lesson>,
    @InjectRepository(Purchase)
    private purchasesRepository: Repository<Purchase>,
  ) { }

  // async getAvailableLessons(): Promise<Lesson[]> {
  //   return this.lessonsRepository.find();
  // }

  async getAvailableLessons(): Promise<any[]> {
    const lessons = await this.lessonsRepository.find({
      relations: ['teacher'], // make sure "teacher" is in Lesson entity
    });

    return lessons.map(lesson => ({
      ...lesson,
      teacherName: lesson.teacher?.name || '', // flatten teacher name
    }));
  }


  // async getPurchasedLessons(studentId: string): Promise<Lesson[]> {
  //   const purchases = await this.purchasesRepository.find({
  //     where: { studentId },
  //     relations: ['lesson'],
  //   });
  //   return purchases.map(p => p.lesson);
  // }

  async getPurchasedLessons(studentId: string): Promise<any[]> {
    const purchases = await this.purchasesRepository.find({
      where: { studentId },
      relations: ['lesson', 'lesson.teacher'],
    });

    return purchases.map(p => ({
      ...p.lesson,
      teacherName: p.lesson.teacher?.name || '',
    }));
  }

  // async purchaseLessons(studentId: string, items: { lessonId: string }[]) {
  //   // Implement purchase logic
  //   // This is a simplified version
  //   const purchases = items.map(item => ({
  //     studentId,
  //     lessonId: item.lessonId,
  //     purchaseDate: new Date(),
  //   }));

  //   await this.purchasesRepository.save(purchases);
  //   return { success: true };
  // }

  async purchaseLessons(studentId: string, items: { lessonId: string }[]) {
    const purchases: Purchase[] = [];

    for (const item of items) {
      const lesson = await this.lessonsRepository.findOne({
        where: { id: item.lessonId },
      });

      if (!lesson) {
        throw new Error(`Lesson with ID ${item.lessonId} not found`);
      }

      purchases.push(
        this.purchasesRepository.create({
          studentId,
          lessonId: item.lessonId,
          amount: lesson.price, // ✅ no null constraint problem now
          userId: studentId,    // if you also want to store in userId
        })
      );
    }

    await this.purchasesRepository.save(purchases);
    return { success: true };
  }

}