import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LessonsModule } from './lessons/lessons.module';
import { PurchasesModule } from './purchases/purchases.module';
import { RatingsModule } from './ratings/ratings.module';
import { CommonModule } from './common/common.module';
import { StudentModule } from './student/student.module';
import { TeacherModule } from './teacher/teacher.module';
import { PaymentModule } from './payment/payment.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AiModule } from './ai/ai.module';
import { ChatModule } from './chat/chat.module';
import { ProfileModule } from './profile/profile.module';

import { MailerModule } from '@nestjs-modules/mailer';
import { SupportModule } from './supportmodule/supportmodule.module';
import { TasksModule } from './tasks/tasks.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminModule } from './admin/admin.module';
import { VideosModule } from './videos/videos.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    // V V V V V ADD THIS LINE HERE V V V V V
    ScheduleModule.forRoot(),
    // ^ ^ ^ ^ ^ END OF THE NEW LINE ^ ^ ^ ^ ^
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'wasi7122',
        database: process.env.DB_NAME || 'mzatinova_demia_db',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development',
      }),
    }),

    // --- ADD THIS ENTIRE MAILERMODULE CONFIGURATION ---
    MailerModule.forRootAsync({
      imports: [ConfigModule], // Make sure ConfigModule is imported
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('SMTP_HOST'),
          port: configService.get('SMTP_PORT'),
          secure: false,
          auth: {
            user: configService.get('SMTP_USER'),
            pass: configService.get('SMTP_PASS'),
          },
        },
        defaults: {
          from: `"Annex Support Team" <${configService.get('MAIL_FROM')}>`,
        },
      }),
      inject: [ConfigService],
    }),
    // --- END OF NEW MAILERMODULE CONFIGURATION ---

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    AuthModule,
    UsersModule,
    LessonsModule,
    PurchasesModule,
    RatingsModule,
    CommonModule,
    StudentModule,
    TeacherModule,
    forwardRef(() => PaymentModule),
    forwardRef(() => NotificationsModule),
    forwardRef(() => AiModule),
    forwardRef(() => ChatModule),
    forwardRef(() => ProfileModule),
    forwardRef(() => SupportModule),
    TasksModule,
    AdminModule,
    VideosModule,




  ],
  controllers: [],
  providers: [],
})
export class AppModule { }




