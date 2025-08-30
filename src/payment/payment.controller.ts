import { Controller, Post, Body, HttpException, HttpStatus, Req, Headers as NestHeaders, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateBankPaymentDto } from './dto/create-bank-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Assuming you have a JWT Guard
import { CurrentUser } from '../auth/decorators/current-user.decorator'; // Assuming you have this decorator
import { User } from '../users/entities/user.entity'; // Assuming this is your User entity

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentsService: PaymentService) { }

  /**
   * Endpoint for Mobile Money Payments
   * POST /payments/initiate-mobile-money
   */
  @Post('initiate-mobile-money')
  @UseGuards(JwtAuthGuard) // Protect this route, only logged-in users can pay
  async initiateMobileMoneyPayment(
    @CurrentUser() user: User, // <-- Get the authenticated user
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    try {
      const result = await this.paymentsService.initiateMobileMoneyPayment(
        createPaymentDto,
        user.id, // <-- Pass the user's ID to the service
      );
      return result;
    } catch (error) {
      console.error('Failed to initiate mobile money payment:', error.response?.data || error.message);
      throw new HttpException('Failed to initiate mobile money payment.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * NEW Endpoint for Bank Transfer Payments
   * POST /payments/initiate-bank-transfer
   */
  @Post('initiate-bank-transfer')
  @UseGuards(JwtAuthGuard) // Protect this route
  async initiateBankTransfer(
    @CurrentUser() user: User, // <-- Get the authenticated user
    @Body() createBankPaymentDto: CreateBankPaymentDto,
  ) {
    try {
      const result = await this.paymentsService.initiateBankTransferPayment(
        createBankPaymentDto,
        user.id, // <-- Pass the user's ID to the service
      );
      return result;
    } catch (error) {
      console.error('Failed to initiate bank transfer:', error.response?.data || error.message);
      throw new HttpException('Failed to initiate bank transfer.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Endpoint to receive webhook notifications from PayChangu
   */
  @Post('webhook')
  async handleWebhook(
    @NestHeaders('signature') signature: string,
    @Req() req: Request & { rawBody: Buffer },
  ) {
    try {
      await this.paymentsService.handlePaymentWebhook(signature, req.rawBody);
      return { status: 'success' };
    } catch (error) {
      console.error('Webhook processing failed:', error.message);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}

// import { Controller, Post, Body, HttpException, HttpStatus, Req, Headers as NestHeaders } from '@nestjs/common';
// import { PaymentService } from './payment.service';
// import { CreatePaymentDto } from './dto/create-payment.dto';
// import { CreateBankPaymentDto } from './dto/create-bank-payment.dto'; // <-- Import the new DTO

// @Controller('payments')
// export class PaymentController {
//   constructor(private readonly paymentsService: PaymentService) { }

//   /**
//    * Endpoint for Mobile Money Payments
//    * POST /payments/initiate-mobile-money
//    */
//   @Post('initiate-mobile-money')
//   async initiateMobileMoneyPayment(@Body() createPaymentDto: CreatePaymentDto) {
//     try {
//       const result = await this.paymentsService.initiateMobileMoneyPayment(
//         createPaymentDto,
//       );
//       return result;
//     } catch (error) {
//       console.error('Failed to initiate mobile money payment:', error.response?.data || error.message);
//       throw new HttpException(
//         'Failed to initiate mobile money payment.',
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }

//   /**
//    * NEW Endpoint for Bank Transfer Payments
//    * POST /payments/initiate-bank-transfer
//    */
//   @Post('initiate-bank-transfer')
//   async initiateBankTransfer(@Body() createBankPaymentDto: CreateBankPaymentDto) {
//     try {
//       const result = await this.paymentsService.initiateBankTransferPayment(
//         createBankPaymentDto,
//       );
//       return result;
//     } catch (error) {
//       console.error('Failed to initiate bank transfer:', error.response?.data || error.message);
//       throw new HttpException(
//         'Failed to initiate bank transfer.',
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }
//   /**
//    * Endpoint to receive webhook notifications from PayChangu
//    */
//   /**
//    * Endpoint to receive webhook notifications from PayChangu
//    */
//   // ... inside your PaymentController class

//   @Post('webhook')
//   async handleWebhook(
//     @NestHeaders('signature') signature: string, // <-- USE THE RENAMED DECORATOR
//     @Req() req: Request & { rawBody: Buffer },
//   ) {
//     try {
//       await this.paymentsService.handlePaymentWebhook(signature, req.rawBody);
//       return { status: 'success' };
//     } catch (error) {
//       console.error('Webhook processing failed:', error.message);
//       throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
//     }
//   }
// }