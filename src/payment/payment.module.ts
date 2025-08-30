import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PurchasesModule } from 'src/purchases/purchases.module';
import { LessonsModule } from 'src/lessons/lessons.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { TeacherModule } from 'src/teacher/teacher.module';

@Module({
  imports: [
    HttpModule,
    AuthModule,
    UsersModule,
    TeacherModule,
    forwardRef(() => PurchasesModule), // <-- Wrap PurchasesModule
    forwardRef(() => LessonsModule),   // <-- Wrap LessonsModule
  ],
  providers: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule { }