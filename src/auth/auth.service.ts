// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new UnauthorizedException('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    // Generate token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };

    return {
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
    };

    return {
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions || [],
      },
    };
  }

  async sendPasswordResetEmail(email: string) {
    // In production: Generate and send reset token
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal whether email exists
      return { message: 'If an account exists, a reset link has been sent' };
    }

    // TODO: Implement actual email sending
    return { message: 'Password reset link sent' };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.usersService.findById(userId);

    // --- ADD THIS CHECK ---
    // If no user is found, throw an error and stop.
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // --- END OF CHECK ---

    // 1. Check if the provided current password is correct
    const isPasswordMatching = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password, // Now TypeScript knows 'user' is not null here
    );

    if (!isPasswordMatching) {
      throw new UnauthorizedException('Wrong current password');
    }

    // 2. Hash the new password
    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    // 3. Update the user's password in the database
    await this.usersService.updatePassword(userId, hashedNewPassword);
  }
}