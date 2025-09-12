import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SupportService } from './supportmodule.service';
import { CreateSupportmoduleDto } from './dto/create-supportmodule.dto';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) { }

  @UseGuards(JwtAuthGuard)
  @Post('ticket')
  async createSupportTicket(
    @Body() createSupportTicketDto: CreateSupportmoduleDto,
    @Req() req: any, // Use your authenticated request type here
  ) {
    // req.user is attached by the JwtAuthGuard
    return this.supportService.sendSupportTicket(createSupportTicketDto, req.user);
  }
}
