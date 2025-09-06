// src/users/users.controller.ts
import { Controller, Get, Param, Post, Body, HttpCode, HttpStatus, UseGuards, UseInterceptors, Req, UploadedFile, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() userData: Partial<User>): Promise<User> {
    return this.usersService.create(userData);
  }

  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard) // Your guard protects this route
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadAvatar(
    @Req() req: Request, // The request object
    @UploadedFile(/* your validation pipes */) file: Express.Multer.File,
  ) {
    // THE ONLY CHANGE IS HERE ▼
    // We get the full user object from the request, which your guard attached.
    // const userId = (req.user as User).id;

    const user = (req as any).user;
    const userId = user.id;

    // Construct the public URL for the file
    // const publicUrl = `http://localhost:3001/uploads/${file.filename}`;
    const relativeUrl = `/uploads/${file.filename}`;

    // Call your service to update the user in the database
    await this.usersService.updateProfileImageUrl(userId, relativeUrl);

    // Return the new URL so the frontend can update its state
    return {
      message: 'Avatar updated successfully',
      profileImageUrl: relativeUrl,
    };
  }

  @Get('email/:email')
  @HttpCode(HttpStatus.OK)
  async findByEmail(@Param('email') email: string): Promise<User | null> {
    return this.usersService.findByEmail(email);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string): Promise<User | null> {
    return this.usersService.findById(id);
  }

  @Patch('profile') // Handles PATCH requests to /users/profile
  @UseGuards(JwtAuthGuard) // Protects the route
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Req() req: any, // Use `any` for simplicity or create a proper Request type
    @Body() updateUserDto: UpdateUserDto, // Validate the incoming data
  ): Promise<User> {
    const userId = req.user.id; // Get the user's ID from the token payload
    return this.usersService.updateProfile(userId, updateUserDto);
  }
}