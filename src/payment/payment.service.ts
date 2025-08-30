import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { createHmac } from 'node:crypto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateBankPaymentDto } from './dto/create-bank-payment.dto';
import { PurchasesService } from '../purchases/purchases.service';
import { LessonsService } from '../lessons/lessons.service';

const MOBILE_MONEY_OPERATORS = {
  airtel: '20be6c20-adeb-4b5b-a7ba-0769820df4fb',
  mpamba: '27494cb5-ba9e-437f-a114-4e7a7686bcca',
};

@Injectable()
export class PaymentService {
  constructor(
    private readonly httpService: HttpService,
    private readonly purchasesService: PurchasesService,
    private readonly lessonsService: LessonsService,
  ) { }

  /**
   * Initiates a Mobile Money payment.
   */
  async initiateMobileMoneyPayment(
    paymentDetails: CreatePaymentDto,
    studentId: string,
  ) {
    const lesson = await this.lessonsService.findOne(paymentDetails.lessonId);
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${paymentDetails.lessonId} not found.`);
    }

    const uniqueChargeId = `ANNEX-MOMO-${Date.now()}`;

    await this.purchasesService.createPendingPurchaseForPayment({
      chargeId: uniqueChargeId,
      studentId: studentId,
      lessonId: paymentDetails.lessonId,
      amount: lesson.price,
    });

    const apiUrl = 'https://api.paychangu.com/mobile-money/payments/initialize';
    const secretKey = process.env.PAYCHANGU_SECRET_KEY;
    const operatorRefId = MOBILE_MONEY_OPERATORS[paymentDetails.provider];

    if (!operatorRefId) {
      throw new InternalServerErrorException('Invalid mobile money provider specified.');
    }

    const payload = {
      amount: lesson.price.toString(),
      mobile: paymentDetails.mobile,
      mobile_money_operator_ref_id: operatorRefId,
      charge_id: uniqueChargeId,
      email: paymentDetails.email,
      first_name: paymentDetails.firstName,
      last_name: paymentDetails.lastName,
    };

    const headers = {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    };

    try {
      return await firstValueFrom(this.httpService.post(apiUrl, payload, { headers }));
    } catch (error) {
      console.error('Error initiating mobile money payment:', error.response?.data);
      throw new InternalServerErrorException('Failed to initiate mobile money payment.');
    }
  }

  /**
   * Initiates a Bank Transfer payment.
   */
  async initiateBankTransferPayment(
    paymentDetails: CreateBankPaymentDto,
    studentId: string,
  ) {
    const lesson = await this.lessonsService.findOne(paymentDetails.lessonId);
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${paymentDetails.lessonId} not found.`);
    }

    const uniqueChargeId = `ANNEX-BANK-${Date.now()}`;

    await this.purchasesService.createPendingPurchaseForPayment({
      chargeId: uniqueChargeId,
      studentId: studentId,
      lessonId: paymentDetails.lessonId,
      amount: lesson.price,
    });

    const apiUrl = 'https://api.paychangu.com/direct-charge/payments/initialize';
    const secretKey = process.env.PAYCHANGU_SECRET_KEY;

    const payload = {
      payment_method: 'mobile_bank_transfer',
      amount: lesson.price.toString(),
      currency: 'MWK',
      charge_id: uniqueChargeId,
      email: paymentDetails.email,
    };

    const headers = {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    };

    try {
      return await firstValueFrom(this.httpService.post(apiUrl, payload, { headers }));
    } catch (error) {
      console.error('Error initiating bank transfer:', error.response?.data);
      throw new InternalServerErrorException('Failed to initiate bank transfer.');
    }
  }

  /**
   * Handles and verifies incoming webhooks from PayChangu to confirm payment status.
   */
  async handlePaymentWebhook(signature: string, payload: Buffer) {
    const webhookSecret = process.env.PAYCHANGU_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('PayChangu webhook secret is not configured.');
      throw new InternalServerErrorException('Webhook secret not configured.');
    }
    if (!signature) {
      throw new BadRequestException('Missing signature header');
    }

    const computedSignature = createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    if (computedSignature !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const eventData = JSON.parse(payload.toString());
    const eventType = eventData.event_type;
    const transactionData = eventData.data?.transaction || eventData;
    const chargeId = transactionData.charge_id;

    console.log(`Received valid webhook event: ${eventType} for charge ID: ${chargeId}`);

    if (eventType === 'charge.success' || eventType === 'api.charge.payment') {
      await this.purchasesService.finalizePurchase(chargeId);
    } else if (eventType === 'charge.failed') {
      // await this.purchasesService.failPurchase(chargeId);
      console.log(`Webhook received for failed charge ID: ${chargeId}`);
    }
  }
}


// import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
// import { HttpService } from '@nestjs/axios';
// import { firstValueFrom } from 'rxjs';
// import { AxiosError } from 'axios';
// import { CreatePaymentDto } from './dto/create-payment.dto';
// import { CreateBankPaymentDto } from './dto/create-bank-payment.dto'; // <-- Import the new DTO
// import { createHmac } from 'node:crypto'; // <-- CORRECT IMPORT

// // Store the operator IDs as constants for easy access and maintenance.
// const MOBILE_MONEY_OPERATORS = {
//   airtel: '20be6c20-adeb-4b5b-a7ba-0769820df4fb',
//   mpamba: '27494cb5-ba9e-437f-a114-4e7a7686bcca',
// };

// @Injectable()
// export class PaymentService {
//   constructor(private readonly httpService: HttpService) { }

//   /**
//    * Method for Mobile Money Payments
//    */
//   async initiateMobileMoneyPayment(paymentDetails: CreatePaymentDto) {
//     const apiUrl = 'https://api.paychangu.com/mobile-money/payments/initialize';
//     const secretKey = process.env.PAYCHANGU_SECRET_KEY;

//     // 1. Dynamically get the operator ref_id based on the provider from the request
//     const operatorRefId = MOBILE_MONEY_OPERATORS[paymentDetails.provider];

//     if (!operatorRefId) {
//       // This case is handled by the DTO validation, but it's good practice to check
//       throw new InternalServerErrorException('Invalid mobile money provider specified.');
//     }

//     const uniqueChargeId = `ANNEX-MOMO-${Date.now()}`;

//     const payload = {
//       amount: paymentDetails.amount.toString(),
//       mobile: paymentDetails.mobile,
//       mobile_money_operator_ref_id: operatorRefId,
//       charge_id: uniqueChargeId,
//       email: paymentDetails.email,
//       first_name: paymentDetails.firstName,
//       last_name: paymentDetails.lastName,
//     };

//     const headers = {
//       'Authorization': `Bearer ${secretKey}`,
//       'Content-Type': 'application/json',
//     };

//     try {
//       const response = await firstValueFrom(
//         this.httpService.post(apiUrl, payload, { headers }),
//       );
//       console.log('PayChangu API Response:', response.data);
//       return response.data;
//     } catch (error) {
//       // ... (error handling)
//       throw error;
//     }
//   }

//   /**
//    * NEW Method for Bank Transfer Payments
//    */
//   async initiateBankTransferPayment(paymentDetails: CreateBankPaymentDto) {
//     const apiUrl = 'https://api.paychangu.com/direct-charge/payments/initialize';
//     const secretKey = process.env.PAYCHANGU_SECRET_KEY;
//     const uniqueChargeId = `ANNEX-BANK-${Date.now()}`;

//     const payload = {
//       payment_method: 'mobile_bank_transfer',
//       amount: paymentDetails.amount.toString(),
//       currency: 'MWK',
//       charge_id: uniqueChargeId,
//       email: paymentDetails.email,
//     };

//     const headers = {
//       'Authorization': `Bearer ${secretKey}`,
//       'Content-Type': 'application/json',
//     };

//     try {
//       const response = await firstValueFrom(
//         this.httpService.post(apiUrl, payload, { headers }),
//       );
//       console.log('Bank Transfer Initiated:', response.data);
//       // This response contains the bank details to show to the student
//       return response.data;
//     } catch (error) {
//       if (error instanceof AxiosError) {
//         console.error('Error from PayChangu:', error.response?.data);
//       } else {
//         console.error('An unexpected error occurred:', error);
//       }
//       throw error;
//     }
//   }
//   /**
//      * Handles and verifies incoming webhooks from PayChangu to confirm payment status.
//      * @param signature The 'signature' header from the incoming request.
//      * @param payload The raw body buffer of the incoming request.
//      */
//   async handlePaymentWebhook(signature: string, payload: Buffer) {
//     const webhookSecret = process.env.PAYCHANGU_WEBHOOK_SECRET;

//     // 1. FIX: Check if the webhook secret exists before using it.
//     // This resolves the TypeScript error and prevents crashes.
//     if (!webhookSecret) {
//       console.error('PayChangu webhook secret is not configured in .env file.');
//       throw new InternalServerErrorException('Webhook secret not configured.');
//     }

//     // 2. Security Check: Verify the signature to ensure the request is from PayChangu.
//     if (!signature) {
//       throw new BadRequestException('Missing signature header');
//     }

//     // TypeScript is now happy because it knows webhookSecret is a string here.
//     const computedSignature = createHmac('sha256', webhookSecret)
//       .update(payload)
//       .digest('hex');

//     if (computedSignature !== signature) {
//       throw new BadRequestException('Invalid webhook signature');
//     }

//     // 3. Process the Event: If the signature is valid, parse the payload.
//     const eventData = JSON.parse(payload.toString());
//     const eventType = eventData.event_type;
//     // The payload structure can vary, so check for transaction data in common locations.
//     const transactionData = eventData.data?.transaction || eventData;

//     console.log(
//       `Received valid webhook event: ${eventType} for charge ID: ${transactionData.charge_id}`,
//     );

//     // 4. Execute Business Logic: Act based on the event type.
//     if (eventType === 'charge.success' || eventType === 'api.charge.payment') {
//       const chargeId = transactionData.charge_id;

//       // =======================================================
//       // YOUR BUSINESS LOGIC FOR A SUCCESSFUL PAYMENT GOES HERE
//       // =======================================================
//       // 1. Find the purchase in your database using the `chargeId`.
//       // 2. Confirm the purchase hasn't already been processed.
//       // 3. Update the purchase status to 'completed'.
//       // 4. Grant the student access to the lesson.
//       // 5. (Later) Trigger the automated payout to the teacher.
//       // =======================================================

//       console.log(`Processing successful payment for charge ID: ${chargeId}`);

//     } else if (eventType === 'charge.failed') {
//       const chargeId = transactionData.charge_id;

//       // =======================================================
//       // YOUR LOGIC FOR A FAILED PAYMENT GOES HERE
//       // =======================================================
//       // 1. Find the purchase in your database and update its status to 'failed'.
//       // 2. Optionally, send an email to the student.
//       // =======================================================

//       console.log(`Processing failed payment for charge ID: ${chargeId}`);
//     }
//   }
// }