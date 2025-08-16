import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { PurchaseResponseDto } from './dto/purchase-response.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import { AuthGuard } from '@nestjs/passport';
// import { User } from '../users/user.entity';

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) { }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async checkout(
    @CurrentUser() user: User,
    @Body() createPurchaseDto: CreatePurchaseDto,
  ): Promise<PurchaseResponseDto[]> {
    return this.purchasesService.createPurchase(user.id, createPurchaseDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserPurchases(
    @CurrentUser() user: User,
  ): Promise<PurchaseResponseDto[]> {
    return this.purchasesService.getUserPurchases(user.id);
  }
}