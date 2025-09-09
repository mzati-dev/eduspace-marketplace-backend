import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { TutorProfile } from './entities/profile.entity';
import { UpdateTutorProfileDto } from './dto/update-profile.dto';


@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(TutorProfile)
    private readonly profileRepository: Repository<TutorProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  /**
   * Fetches the profile for a specific user.
   */
  // ✅ FIX: The userId parameter is now correctly typed as a STRING.
  // async findProfileByUserId(userId: string): Promise<TutorProfile> {
  //   const profile = await this.profileRepository.findOneBy({
  //     user: { id: userId },
  //   });

  //   if (!profile) {
  //     throw new NotFoundException(`Profile for user ID ${userId} not found.`);
  //   }
  //   return profile;
  // }
  // In src/profile/profile.service.ts

  async findProfileByUserId(userId: string): Promise<TutorProfile> {
    // Use findOne, not findOneBy
    const profile = await this.profileRepository.findOne({
      where: {
        user: { id: userId }
      },
      relations: ['user']
    });

    if (!profile) {
      throw new NotFoundException(`Profile for user ID ${userId} not found.`);
    }
    return profile;
  }
  /**
   * Creates or updates a profile.
   */
  // ✅ FIX: The userId parameter is now correctly typed as a STRING.
  async createOrUpdateProfile(
    userId: string,
    dto: UpdateTutorProfileDto,
  ): Promise<TutorProfile> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    let profile = await this.profileRepository.findOneBy({
      user: { id: userId },
    });

    if (!profile) {
      profile = this.profileRepository.create({ ...dto, user });
    } else {
      Object.assign(profile, dto);
    }

    return this.profileRepository.save(profile);
  }

  // ✅ ADD THIS METHOD
  // async findAllPublicProfiles(): Promise<TutorProfile[]> {
  //   return this.profileRepository.find({
  //     where: { isAvailableForNewStudents: true },
  //     relations: ['user'],
  //   });
  // }
  // in src/profile/profile.service.ts
  async findAllPublicProfiles(): Promise<TutorProfile[]> {
    return this.profileRepository.find({
      where: { isAvailableForNewStudents: true },
      relations: ['user'], // ✅ ADD THIS LINE
    });
  }
}