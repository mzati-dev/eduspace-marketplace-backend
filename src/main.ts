// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
// 👇 1. Add these imports
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  // 👇 2. Change this line to use NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // // V V V V V TEMPORARY CODE TO HASH A PASSWORD V V V V V
  // const plainPassword = 'SuperSecretAdmin123!';
  // const salt = await bcrypt.genSalt();
  // const hashedPassword = await bcrypt.hash(plainPassword, salt);
  // console.log('--- ADMIN HASHED PASSWORD (COPY THIS) ---');
  // console.log(hashedPassword);
  // console.log('-----------------------------------------');
  // // ^ ^ ^ ^ ^ END OF TEMPORARY CODE ^ ^ ^ ^ ^

  // This is the fix for large file uploads (your existing code is good)
  app.use(json({
    limit: '250mb',
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    },
  }));
  app.use(urlencoded({ extended: true, limit: '250mb' }));

  // 👇 3. Add this line to make your uploads folder public
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // This is for your frontend to communicate with your backend (your existing code is good)
  app.enableCors({
    origin: 'http://localhost:3000', // Note: This should match your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT || 3001);
}
bootstrap();

// // src/main.ts
// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { json, urlencoded } from 'express';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   // This is the fix for large file uploads
//   // Combine limit and verify into a single json middleware call
//   app.use(json({
//     limit: '250mb',
//     verify: (req: any, res, buf) => {
//       req.rawBody = buf;
//     },
//   }));
//   app.use(urlencoded({ extended: true, limit: '250mb' }));



//   // This is for your frontend to communicate with your backend
//   app.enableCors({
//     origin: 'http://localhost:3000',
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
//     credentials: true,
//     allowedHeaders: ['Content-Type', 'Authorization'],
//   });

//   await app.listen(process.env.PORT || 3001);
// }
// bootstrap();

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// // --- ADD THESE IMPORTS ---
// import { NestExpressApplication } from '@nestjs/platform-express';
// import { join } from 'path';

// async function bootstrap() {
//   // --- CHANGE THIS LINE to use NestExpressApplication ---
//   const app = await NestFactory.create<NestExpressApplication>(AppModule);

//   // --- ADD THIS LINE to make the 'uploads' folder public ---
//   app.useStaticAssets(join(__dirname, '..', 'uploads'), {
//     prefix: '/uploads/', // The URL prefix to access the files
//   });

//   app.enableCors({
//     origin: 'http://localhost:3000',
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
//     credentials: true,
//     allowedHeaders: ['Content-Type', 'Authorization'],
//   });

//   await app.listen(process.env.PORT || 3001);
// }
// bootstrap();

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);


//   app.enableCors({
//     origin: 'http://localhost:3000',
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
//     credentials: true,
//     allowedHeaders: ['Content-Type', 'Authorization'],
//   });



//   await app.listen(process.env.PORT || 3001);
// }
// bootstrap();