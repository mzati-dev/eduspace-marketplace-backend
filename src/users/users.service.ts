// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  // === ADD THIS METHOD ===
  /**
   * Finds a user by ID and updates their profile image URL.
   * @param userId The ID of the user to update.
   * @param profileImageUrl The new public URL of the profile image.
   * @returns The updated user entity.
   */
  async updateProfileImageUrl(userId: string, profileImageUrl: string): Promise<User> {
    // 1. Find the user by their ID
    const user = await this.findById(userId);

    // 2. If the user doesn't exist, throw an error
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    // 3. Update the profile image URL property
    user.profileImageUrl = profileImageUrl;

    // 4. Save the updated user back to the database
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }
}