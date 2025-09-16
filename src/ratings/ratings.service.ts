import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { Rating } from './rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { User } from 'src/users/entities/user.entity';
import { Rating } from './entities/rating.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
// import { Lesson } from '../lessons/lesson.entity';
// import { User } from '../users/user.entity';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    // V V V V V ADD THESE TWO INJECTIONS V V V V V
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
    // ^ ^ ^ ^ ^ END OF NEW INJECTIONS ^ ^ ^ ^ ^
  ) { }

  async createRating(userId: string, createRatingDto: CreateRatingDto): Promise<Rating> {
    const { lessonId, rating, comment } = createRatingDto;

    // Check if user already rated this lesson
    const existingRating = await this.ratingRepository.findOne({
      where: { userId, lessonId },
    });

    if (existingRating) {
      throw new Error('You have already rated this lesson');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const lesson = await this.lessonRepository.findOne({ where: { id: lessonId } });
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const newRating = this.ratingRepository.create({
      rating,
      comment,
      user,
      lesson,
    });

    await this.ratingRepository.save(newRating);

    // V V V V V ADD THIS NOTIFICATION BLOCK HERE V V V V V
    try {
      // Create a notification for the TEACHER of the lesson.
      await this.notificationsService.create({
        userId: lesson.teacherId, // The notification is for the teacher
        type: 'NEW_RATING',
        title: `New Rating for '${lesson.title}'`,
        description: `You've received a new ${rating}/5 star rating for your lesson from a student.`,
      });
    } catch (error) {
      // Log any errors, but don't fail the main rating process if notification fails.
      console.error('Failed to send new rating notification:', error);
    }
    // ^ ^ ^ ^ ^ END OF THE NOTIFICATION BLOCK ^ ^ ^ ^ ^

    // Update lesson average rating
    await this.updateLessonAverageRating(lessonId);

    return newRating;
  }

  async getLessonRatings(lessonId: string): Promise<Rating[]> {
    return this.ratingRepository.find({
      where: { lessonId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  private async updateLessonAverageRating(lessonId: string): Promise<void> {
    const result = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.rating)', 'average')
      .where('rating.lessonId = :lessonId', { lessonId })
      .getRawOne();

    const averageRating = parseFloat(result.average) || 0;

    await this.lessonRepository.update(lessonId, {
      averageRating,
    });
  }
}