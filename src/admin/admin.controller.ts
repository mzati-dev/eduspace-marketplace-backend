// src/admin/admin.controller.ts
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { CreateAdminUserDto } from './dto/create-admin.dto';
// import { ChiefAdminGuard } from 'src/auth/guards/chief-admin.guard';


@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard) // Secure the whole controller for admins only
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get('users')
  // @UseGuards(ChiefAdminGuard)
  findAllUsers() {
    return this.adminService.findAllUsers();
  }

  @Post('users')
  // @UseGuards(ChiefAdminGuard)
  createUser(@Body() createUserDto: CreateAdminUserDto) {
    return this.adminService.createUser(createUserDto);
  }
}