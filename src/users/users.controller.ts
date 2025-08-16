// src/users/users.controller.ts
import { Controller, Get, Param, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() userData: Partial<User>): Promise<User> {
    return this.usersService.create(userData);
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
}