import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
// import { Purchase } from './purchase.entity';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
// import { User } from '../users/user.entity';
// import { Lesson } from '../lessons/lesson.entity';
import { PurchaseResponseDto } from './dto/purchase-response.dto';
import { Purchase } from './entities/purchase.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly connection: Connection
  ) { }



  // async createPurchase(userId: string, createPurchaseDto: CreatePurchaseDto): Promise<PurchaseResponseDto[]> {
  //   console.log('--- CHECKING IF THE NEW CODE IS RUNNING ---');
  //   const user = await this.userRepository.findOne({ where: { id: userId } });
  //   if (!user) {
  //     throw new Error('User not found');
  //   }

  //   const purchases: Purchase[] = [];

  //   // Process each item in the cart
  //   for (const item of createPurchaseDto.items) {
  //     const lesson = await this.lessonRepository.findOne({
  //       where: { id: item.lessonId },
  //       relations: ['teacher'],
  //     });

  //     if (!lesson) {
  //       throw new Error(`Lesson with ID ${item.lessonId} not found`);
  //     }

  //     const purchase = this.purchaseRepository.create({
  //       amount: lesson.price,
  //       user,
  //       lesson,
  //     });

  //     purchases.push(purchase);

  //     // --- THIS IS THE CRITICAL PART ---
  //     // We will now see if this block succeeds or fails
  //     try {
  //       console.log(`ATTEMPTING to increment salesCount for lesson ID: ${lesson.id}`);
  //       const result = await this.lessonRepository.increment({ id: lesson.id }, 'salesCount', 1);
  //       console.log(`SUCCESSFULLY incremented salesCount. Result:`, result);
  //     } catch (error) {
  //       // If there's an error, it will be logged here
  //       console.error(`FAILED to increment salesCount for lesson ID: ${lesson.id}`, error);
  //     }
  //     // --- END OF CRITICAL PART ---
  //   }

  //   // Save all purchases in a transaction
  //   const savedPurchases = await this.purchaseRepository.save(purchases);

  //   return savedPurchases.map(purchase => new PurchaseResponseDto(purchase));
  // }


  // In purchases.service.ts
  async createPurchase(userId: string, createPurchaseDto: CreatePurchaseDto): Promise<PurchaseResponseDto[]> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const purchases: Purchase[] = [];
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      for (const item of createPurchaseDto.items) {
        const lesson = await queryRunner.manager.findOne(Lesson, {
          where: { id: item.lessonId },
          lock: { mode: "pessimistic_write" }
        });
        if (!lesson) throw new Error(`Lesson ${item.lessonId} not found`);

        // PROPER WAY TO INCREMENT - Using query builder
        await queryRunner.manager
          .createQueryBuilder()
          .update(Lesson)
          .set({
            salesCount: () => "salesCount + 1"
          })
          .where("id = :id", { id: lesson.id })
          .execute();

        // Create purchase
        const purchase = new Purchase();
        purchase.amount = lesson.price;
        purchase.user = user;
        purchase.lesson = lesson;
        purchase.studentId = userId;
        purchase.lessonId = lesson.id;
        purchases.push(purchase);
      }

      await queryRunner.manager.save(purchases);
      await queryRunner.commitTransaction();
      return purchases.map(p => new PurchaseResponseDto(p));

    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error('Purchase failed:', err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
  // src/purchases/purchases.service.ts



  // async createPurchase(userId: string, createPurchaseDto: CreatePurchaseDto): Promise<PurchaseResponseDto[]> {
  //   const user = await this.userRepository.findOne({ where: { id: userId } });
  //   if (!user) {
  //     throw new Error('User not found');
  //   }

  //   const purchases: Purchase[] = [];
  //   let totalAmount = 0;

  //   // Process each item in the cart
  //   for (const item of createPurchaseDto.items) {
  //     const lesson = await this.lessonRepository.findOne({
  //       where: { id: item.lessonId },
  //       relations: ['teacher'],
  //     });

  //     if (!lesson) {
  //       throw new Error(`Lesson with ID ${item.lessonId} not found`);
  //     }

  //     const purchase = this.purchaseRepository.create({
  //       amount: lesson.price,
  //       user,
  //       lesson,
  //     });

  //     purchases.push(purchase);
  //     totalAmount += lesson.price;

  //     // ADD THESE TWO LINES RIGHT HERE:
  //     await this.lessonRepository.increment({ id: lesson.id }, 'salesCount', 1);
  //     console.log(`Incremented sales count for lesson ${lesson.id}`);
  //   }

  //   // Save all purchases in a transaction
  //   const savedPurchases = await this.purchaseRepository.save(purchases);

  //   return savedPurchases.map(purchase => new PurchaseResponseDto(purchase));
  // }

  async getUserPurchases(userId: string): Promise<PurchaseResponseDto[]> {
    const purchases = await this.purchaseRepository.find({
      where: { userId },
      relations: ['lesson'],
      // order: { purchaseDate: 'DESC' },
    });

    return purchases.map(purchase => new PurchaseResponseDto(purchase));
  }

  // Add these two new methods inside your PurchasesService class

  /**
   * Creates a PENDING purchase record when a payment is started.
   */
  async createPendingPurchaseForPayment(data: {
    chargeId: string;
    studentId: string;
    lessonId: string;
    amount: number;
  }): Promise<Purchase> {
    const purchase = this.purchaseRepository.create({
      ...data,
      status: 'pending',
    });
    return this.purchaseRepository.save(purchase);
  }

  /**
   * Finalizes the purchase when the webhook confirms payment.
   */
  async finalizePurchase(chargeId: string): Promise<void> {
    const purchase = await this.purchaseRepository.findOne({ where: { chargeId } });

    if (!purchase || purchase.status === 'completed') {
      console.log('Purchase not found or already completed.');
      return;
    }

    // This is where you can add logic like incrementing sales count if needed
    // For now, we just mark it as complete
    purchase.status = 'completed';
    await this.purchaseRepository.save(purchase);

    // You would also increment the lesson sales count here
    await this.lessonRepository.increment({ id: purchase.lessonId }, 'salesCount', 1);
  }
}