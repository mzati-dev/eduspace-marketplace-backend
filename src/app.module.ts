import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LessonsModule } from './lessons/lessons.module';
import { PurchasesModule } from './purchases/purchases.module';
import { RatingsModule } from './ratings/ratings.module';
import { CommonModule } from './common/common.module';
import { StudentModule } from './student/student.module';
import { TeacherModule } from './teacher/teacher.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    // TypeOrmModule.forRootAsync({
    //   useFactory: () => ({
    //     type: 'postgres',
    //     host: process.env.DB_HOST,
    //     port: parseInt(process.env.DB_PORT),
    //     username: process.env.DB_USERNAME,
    //     password: process.env.DB_PASSWORD,
    //     database: process.env.DB_NAME,
    //     entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //     synchronize: process.env.NODE_ENV !== 'production',
    //     logging: process.env.NODE_ENV === 'development',
    //   }),
    // }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost', // Fallback value
        port: parseInt(process.env.DB_PORT || '5432'), // Fallback value
        username: process.env.DB_USERNAME || 'postgres', // Fallback value
        password: process.env.DB_PASSWORD || 'wasi7122', // Fallback value
        database: process.env.DB_NAME || 'mzatinova_demia_db', // Fallback value
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development',
      }),
    }),
    AuthModule,
    UsersModule,
    LessonsModule,
    PurchasesModule,
    RatingsModule,
    CommonModule,
    StudentModule,
    TeacherModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }