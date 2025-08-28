// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // This is the fix for large file uploads
  app.use(json({ limit: '250mb' }));
  app.use(urlencoded({ extended: true, limit: '250mb' }));

  // This is for your frontend to communicate with your backend
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT || 3001);
}
bootstrap();

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