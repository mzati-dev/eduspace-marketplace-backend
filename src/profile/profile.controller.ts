import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateTutorProfileDto } from './dto/update-profile.dto';


@Controller('profiles')
export class ProfileController {
  constructor(private readonly profilesService: ProfileService) { }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyProfile(@Req() req) {
    // req.user.id is a STRING from your User entity.
    // This now correctly matches the service method.
    return this.profilesService.findProfileByUserId(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMyProfile(
    @Req() req,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: UpdateTutorProfileDto,
  ) {
    // req.user.id is a STRING from your User entity.
    // This now correctly matches the service method.
    return this.profilesService.createOrUpdateProfile(req.user.id, dto);
  }

  // ✅ ADD THIS PUBLIC ENDPOINT
  @Get()
  findAll() {
    return this.profilesService.findAllPublicProfiles();
  }
}