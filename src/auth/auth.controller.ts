// src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Request, Patch, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
// import { GetUser } from './get-user.decorator'; // 👈 1. Import the GetUser decorator
import { User } from '../users/entities/user.entity'; // 👈 2. Import the User entity
import { GetUser } from './decorators/get-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }



  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // 👇 3. ADD THIS ENTIRE METHOD
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@GetUser() user: User) {
    // The JwtAuthGuard runs, verifies the token, and attaches the user to the request.
    // The @GetUser decorator then extracts that user for you.
    // All you have to do is return it.
    return user;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.sendPasswordResetEmail(body.email);
  }

  @UseGuards(JwtAuthGuard)  // <-- protect this route with JWT auth
  @Get('test-auth')
  testAuth(@Request() req) {
    console.log('User from JWT:', req.user);
    return {
      message: 'JWT AuthGuard + Strategy works!',
      user: req.user,
    };
  }

  // --- ADD THIS NEW ENDPOINT ---
  @Patch('change-password')
  @UseGuards(JwtAuthGuard) // Protects the route
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Req() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = req.user.id; // Get user ID from the JWT token
    await this.authService.changePassword(userId, changePasswordDto);
    return { message: 'Password changed successfully.' };
  }
  // --- END OF NEW ENDPOINT ---
}