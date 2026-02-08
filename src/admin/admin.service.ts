import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { CreateAdminUserDto } from './dto/create-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async findAllUsers(): Promise<User[]> {
    return this.usersRepository.find({
      order: { createdAt: 'DESC' } as any,
    });
  }

  async createUser(createUserDto: CreateAdminUserDto): Promise<User> {
    const { email, role, permissions, password, ...userData } = createUserDto;

    const existingUser = await this.usersRepository.findOneBy({ email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // ⭐ ADD THIS - Set default permissions
    let userPermissions: string[] = [];
    if (role === 'admin') {
      userPermissions = permissions && permissions.length > 0
        ? permissions
        : ['review_lessons']; // Default for new admins
    }

    const newUser = this.usersRepository.create({
      ...userData,
      email,
      password: hashedPassword,
      role,
      permissions: userPermissions,
      isVerified: true, // Users created by an admin are verified by default
    });

    return this.usersRepository.save(newUser);
  }
}