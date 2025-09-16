// src/tasks/tasks.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, Raw, MoreThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Purchase } from 'src/purchases/entities/purchase.entity';
import { Rating } from 'src/ratings/entities/rating.entity'; // Assumes you have a Rating entity
import { CreateNotificationPayload, NotificationsService } from 'src/notifications/notifications.service';
import { User, UserRole } from 'src/users/entities/user.entity';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Purchase)
        private readonly purchaseRepository: Repository<Purchase>,
        private readonly notificationsService: NotificationsService,
        // V V V V V ADD THESE TWO INJECTIONS V V V V V
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(Rating)
        private readonly ratingRepository: Repository<Rating>,
        // ^ ^ ^ ^ ^ END OF NEW INJECTIONS ^ ^ ^ ^ ^
    ) { }

    /**
     * This is a cron job that runs automatically every day at 2:00 AM.
     * You can change the timing in the @Cron() decorator.
     */
    @Cron(CronExpression.EVERY_DAY_AT_2AM)
    async handleRatingReminders() {
        console.log('Running daily task: Sending rating reminders...');

        // 1. Calculate the date range for "3 days ago".
        const threeDaysAgoStart = new Date();
        threeDaysAgoStart.setDate(threeDaysAgoStart.getDate() - 3);
        threeDaysAgoStart.setHours(0, 0, 0, 0); // Start of the day

        const threeDaysAgoEnd = new Date(threeDaysAgoStart);
        threeDaysAgoEnd.setHours(23, 59, 59, 999); // End of the day

        // 2. Find all purchases made 3 days ago that have NOT been rated yet.
        const purchasesToRemind = await this.purchaseRepository.createQueryBuilder('purchase')
            .innerJoinAndSelect('purchase.lesson', 'lesson') // We need the lesson's details
            .where('purchase.createdAt BETWEEN :start AND :end', { start: threeDaysAgoStart, end: threeDaysAgoEnd })
            // This is the key part: it checks if a rating does NOT exist for this student and lesson combination.
            .andWhere(qb => {
                const subQuery = qb.subQuery()
                    .select('rating.id')
                    .from(Rating, 'rating')
                    .where('rating.lessonId = purchase.lessonId')
                    .andWhere('rating.studentId = purchase.studentId')
                    .getQuery();
                return `NOT EXISTS ${subQuery}`;
            })
            .getMany();

        if (purchasesToRemind.length === 0) {
            console.log('No rating reminders to send today.');
            return;
        }

        console.log(`Found ${purchasesToRemind.length} students to remind...`);

        // 3. Create a notification payload for each student.
        const notifications = purchasesToRemind.map(purchase => ({
            userId: purchase.studentId,
            type: 'RATING_REMINDER',
            title: `How was '${purchase.lesson.title}'?`,
            description: 'Share your feedback by rating the lesson. Your review helps other students and supports the teacher.',
        }));

        // 4. Send all notifications at once.
        await this.notificationsService.createMany(notifications);
        console.log('Successfully sent rating reminders.');
    }

    // Add this new function inside the TasksService class

    /**
     * This cron job runs every Monday at 8:00 AM.
     * It calculates each teacher's performance for the past week and sends a summary.
     */
    @Cron('0 8 * * 1') // This string means: at minute 0, of hour 8, on any day-of-month, in any month, on day-of-week 1 (Monday).
    async handleWeeklyTeacherSummary() {
        console.log('Running weekly task: Sending teacher performance summaries...');

        // 1. Get the date for 7 days ago.
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // 2. Find all users who are teachers.
        const teachers = await this.userRepository.find({
            where: { role: UserRole.TEACHER },
        });

        if (teachers.length === 0) {
            console.log('No teachers found to send summaries to.');
            return;
        }

        const notificationPayloads: CreateNotificationPayload[] = [];

        // 3. Loop through each teacher to calculate their individual stats.
        for (const teacher of teachers) {
            // A. Calculate total sales count for the past week
            const salesCount = await this.purchaseRepository.count({
                where: {
                    lesson: { teacher: { id: teacher.id } },
                    createdAt: MoreThanOrEqual(sevenDaysAgo),
                },
            });

            // B. Calculate total earnings for the past week
            const earningsResult = await this.purchaseRepository
                .createQueryBuilder('purchase')
                .innerJoin('purchase.lesson', 'lesson')
                .where('lesson.teacherId = :teacherId', { teacherId: teacher.id })
                .andWhere('purchase.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
                .select('SUM(purchase.amount)', 'total')
                .getRawOne();
            const totalEarnings = parseFloat(earningsResult.total) || 0;

            // C. Calculate new ratings received in the past week
            const ratingsCount = await this.ratingRepository.count({
                where: {
                    lesson: { teacher: { id: teacher.id } },
                    createdAt: MoreThanOrEqual(sevenDaysAgo),
                },
            });

            // D. Construct the notification message
            const description = `This week you earned $${totalEarnings.toFixed(2)}, sold ${salesCount} lessons, and received ${ratingsCount} new ratings. View your dashboard for more details.`;

            // E. Add the notification to our list to be sent
            notificationPayloads.push({
                userId: teacher.id,
                type: 'WEEKLY_SUMMARY',
                title: 'Your Weekly Performance Summary',
                description: description,
            });
        }

        // 4. Send all notifications at once.
        if (notificationPayloads.length > 0) {
            await this.notificationsService.createMany(notificationPayloads);
            console.log(`Successfully sent ${notificationPayloads.length} weekly summaries.`);
        }
    }
}