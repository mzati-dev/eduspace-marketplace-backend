import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
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
    // PaymentModule,
    forwardRef(() => PaymentModule),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

// import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { ServeStaticModule } from '@nestjs/serve-static';
// import { MulterModule } from '@nestjs/platform-express';
// import { diskStorage } from 'multer';
// import { extname, join } from 'path';

// import { AuthModule } from './auth/auth.module';
// import { UsersModule } from './users/users.module';
// import { LessonsModule } from './lessons/lessons.module';
// import { PurchasesModule } from './purchases/purchases.module';
// import { RatingsModule } from './ratings/ratings.module';
// import { CommonModule } from './common/common.module';
// import { StudentModule } from './student/student.module';
// import { TeacherModule } from './teacher/teacher.module';

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true,
//       envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
//     }),
//     TypeOrmModule.forRootAsync({
//       useFactory: () => ({
//         type: 'postgres',
//         host: process.env.DB_HOST || 'localhost',
//         port: parseInt(process.env.DB_PORT || '5432'),
//         username: process.env.DB_USERNAME || 'postgres',
//         password: process.env.DB_PASSWORD || 'wasi7122',
//         database: process.env.DB_NAME || 'mzatinova_demia_db',
//         entities: [__dirname + '/**/*.entity{.ts,.js}'],
//         synchronize: process.env.NODE_ENV !== 'production',
//         logging: process.env.NODE_ENV === 'development',
//       }),
//     }),

//     // Serves the video files publicly from the /uploads URL
//     ServeStaticModule.forRoot({
//       rootPath: join(__dirname, '..', 'uploads'),
//       serveRoot: '/uploads',
//     }),

//     // Configures file uploads with all fixes
//     MulterModule.register({
//       // Sets the file size limit to 200MB
//       limits: {
//         fileSize: 200 * 1024 * 1024,
//       },
//       storage: diskStorage({
//         // Uses the full, absolute path to save files reliably
//         destination: join(process.cwd(), 'uploads', 'videos'),
//         filename: (req, file, cb) => {
//           const randomName = Array(32)
//             .fill(null)
//             .map(() => Math.round(Math.random() * 16).toString(16))
//             .join('');
//           return cb(null, `${randomName}${extname(file.originalname)}`);
//         },
//       }),
//     }),

//     AuthModule,
//     UsersModule,
//     LessonsModule,
//     PurchasesModule,
//     RatingsModule,
//     CommonModule,
//     StudentModule,
//     TeacherModule,
//   ],
//   controllers: [],
//   providers: [],
// })
// export class AppModule { }

// import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { AuthModule } from './auth/auth.module';
// import { UsersModule } from './users/users.module';
// import { LessonsModule } from './lessons/lessons.module';
// import { PurchasesModule } from './purchases/purchases.module';
// import { RatingsModule } from './ratings/ratings.module';
// import { CommonModule } from './common/common.module';
// import { StudentModule } from './student/student.module';
// import { TeacherModule } from './teacher/teacher.module';
// // --- ADD THESE IMPORTS ---
// import { MulterModule } from '@nestjs/platform-express';
// import { diskStorage } from 'multer';
// import { extname } from 'path';

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true,
//       envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
//     }),
//     TypeOrmModule.forRootAsync({
//       useFactory: () => ({
//         type: 'postgres',
//         host: process.env.DB_HOST || 'localhost',
//         port: parseInt(process.env.DB_PORT || '5432'),
//         username: process.env.DB_USERNAME || 'postgres',
//         password: process.env.DB_PASSWORD || 'wasi7122',
//         database: process.env.DB_NAME || 'mzatinova_demia_db',
//         entities: [__dirname + '/**/*.entity{.ts,.js}'],
//         synchronize: process.env.NODE_ENV !== 'production',
//         logging: process.env.NODE_ENV === 'development',
//       }),
//     }),

//     // --- ADD THIS MODULE CONFIGURATION ---
//     MulterModule.register({
//       storage: diskStorage({
//         destination: './uploads/videos', // The folder where files will be saved
//         filename: (req, file, cb) => {
//           // Creates a unique filename to prevent overwrites
//           const randomName = Array(32)
//             .fill(null)
//             .map(() => Math.round(Math.random() * 16).toString(16))
//             .join('');
//           return cb(null, `${randomName}${extname(file.originalname)}`);
//         },
//       }),
//     }),
//     // ------------------------------------

//     AuthModule,
//     UsersModule,
//     LessonsModule,
//     PurchasesModule,
//     RatingsModule,
//     CommonModule,
//     StudentModule,
//     TeacherModule,
//   ],
//   controllers: [],
//   providers: [],
// })
// export class AppModule { }


// // import { Module } from '@nestjs/common';
// // import { ConfigModule } from '@nestjs/config';
// // import { TypeOrmModule } from '@nestjs/typeorm';
// // import { AuthModule } from './auth/auth.module';
// // import { UsersModule } from './users/users.module';
// // import { LessonsModule } from './lessons/lessons.module';
// // import { PurchasesModule } from './purchases/purchases.module';
// // import { RatingsModule } from './ratings/ratings.module';
// // import { CommonModule } from './common/common.module';
// // import { StudentModule } from './student/student.module';
// // import { TeacherModule } from './teacher/teacher.module';
import { PaymentModule } from './payment/payment.module';

// // @Module({
// //   imports: [
// //     ConfigModule.forRoot({
// //       isGlobal: true,
// //       envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
// //     }),
// //     // TypeOrmModule.forRootAsync({
// //     //   useFactory: () => ({
// //     //     type: 'postgres',
// //     //     host: process.env.DB_HOST,
// //     //     port: parseInt(process.env.DB_PORT),
// //     //     username: process.env.DB_USERNAME,
// //     //     password: process.env.DB_PASSWORD,
// //     //     database: process.env.DB_NAME,
// //     //     entities: [__dirname + '/**/*.entity{.ts,.js}'],
// //     //     synchronize: process.env.NODE_ENV !== 'production',
// //     //     logging: process.env.NODE_ENV === 'development',
// //     //   }),
// //     // }),
// //     TypeOrmModule.forRootAsync({
// //       useFactory: () => ({
// //         type: 'postgres',
// //         host: process.env.DB_HOST || 'localhost', // Fallback value
// //         port: parseInt(process.env.DB_PORT || '5432'), // Fallback value
// //         username: process.env.DB_USERNAME || 'postgres', // Fallback value
// //         password: process.env.DB_PASSWORD || 'wasi7122', // Fallback value
// //         database: process.env.DB_NAME || 'mzatinova_demia_db', // Fallback value
// //         entities: [__dirname + '/**/*.entity{.ts,.js}'],
// //         synchronize: process.env.NODE_ENV !== 'production',
// //         logging: process.env.NODE_ENV === 'development',
// //       }),
// //     }),
// //     AuthModule,
// //     UsersModule,
// //     LessonsModule,
// //     PurchasesModule,
// //     RatingsModule,
// //     CommonModule,
// //     StudentModule,
// //     TeacherModule,
// //   ],
// //   controllers: [],
// //   providers: [],
// // })
// // export class AppModule { }