import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { Rating } from './rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { User } from 'src/users/entities/user.entity';
import { Rating } from './entities/rating.entity';
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