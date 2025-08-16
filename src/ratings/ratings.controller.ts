// src/ratings/ratings.controller.ts
import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingResponseDto } from './dto/rating-response.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import { AuthGuard } from '@nestjs/passport';

@Controller('lessons/:id/ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createRating(
    @CurrentUser() user: User,
    @Param('id') lessonId: string,
    @Body() createRatingDto: CreateRatingDto,
  ): Promise<RatingResponseDto> {
    createRatingDto.lessonId = lessonId;
    const rating = await this.ratingsService.createRating(user.id, createRatingDto);
    return new RatingResponseDto(rating);
  }

  @Get()
  async getLessonRatings(@Param('id') lessonId: string): Promise<RatingResponseDto[]> {
    const ratings = await this.ratingsService.getLessonRatings(lessonId);
    return ratings.map(rating => new RatingResponseDto(rating));
  }
}