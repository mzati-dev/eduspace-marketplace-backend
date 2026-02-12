import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(json({ limit: '250mb', verify: (req: any, res, buf) => { req.rawBody = buf; } }));
  app.use(urlencoded({ extended: true, limit: '250mb' }));
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' });
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ========== START OF ADDED CODE ==========
  // const dataSource = app.get(DataSource);
  // await createChiefAdmin(dataSource);
  // ========== END OF ADDED CODE ==========

  const PORT = process.env.PORT || 3001;
  await app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// ========== START OF CORRECTED FUNCTION ==========
async function createChiefAdmin(dataSource: DataSource) {
  try {
    // 1. Force DB to accept role (Just in case)
    try {
      await dataSource.query("ALTER TYPE user_role_enum ADD VALUE 'chief_admin'");
    } catch (e) { }

    const userRepository = dataSource.getRepository('User');

    // 👇 DEFINING EMAILS
    const wrongEmail = 'chiefadmin@eduspacemartekplace.com'; // Typo
    const correctEmail = 'chiefadmin@eduspacemarketplace.com'; // Correct
    const plainPassword = 'admin@123';

    // 👇 2. DELETE THE TYPO USER
    const wrongUser = await userRepository.findOne({ where: { email: wrongEmail } });
    if (wrongUser) {
      await userRepository.delete({ email: wrongEmail });
      console.log(`🗑️  Deleted user with typo email: ${wrongEmail}`);
    }

    // 👇 3. CHECK CORRECT USER
    const adminExists = await userRepository.findOne({
      where: { email: correctEmail }
    });

    if (adminExists) {
      console.log('✅ Chief Admin (Correct Email) already exists');
      return;
    }

    // 👇 4. CREATE CORRECT USER
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    const admin = userRepository.create({
      name: 'Chief Admin',
      email: correctEmail, // <--- Correct spelling
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      phone: '0000000000',
      dob: '2000-01-01',
      gender: 'N/A',
      permissions: ['review_lessons', 'manage_users']
    });

    await userRepository.save(admin);
    console.log(`✅ Chief Admin created: ${correctEmail} / ${plainPassword}`);

  } catch (error) {
    console.log('Error creating chief admin:', error.message);
  }
}
// ========== END OF CORRECTED FUNCTION ==========

bootstrap();

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { json, urlencoded } from 'express';
// import { NestExpressApplication } from '@nestjs/platform-express';
// import { join } from 'path';
// import { DataSource } from 'typeorm';
// import * as bcrypt from 'bcrypt';

// async function bootstrap() {
//   const app = await NestFactory.create<NestExpressApplication>(AppModule);

//   app.use(json({ limit: '250mb', verify: (req: any, res, buf) => { req.rawBody = buf; } }));
//   app.use(urlencoded({ extended: true, limit: '250mb' }));
//   app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' });
//   app.enableCors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
//     credentials: true,
//     allowedHeaders: ['Content-Type', 'Authorization'],
//   });

//   // ========== START OF ADDED CODE ==========
//   const dataSource = app.get(DataSource);
//   await createChiefAdmin(dataSource);
//   // ========== END OF ADDED CODE ==========

//   const PORT = process.env.PORT || 3001;
//   await app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// }

// // ========== START OF UPDATED FUNCTION ==========
// async function createChiefAdmin(dataSource: DataSource) {
//   try {
//     // 1. FORCE THE DATABASE TO ACCEPT 'chief_admin'
//     // We try to add the value. If it already exists, it might throw an error, so we ignore the error.
//     try {
//       await dataSource.query("ALTER TYPE user_role_enum ADD VALUE 'chief_admin'");
//       console.log('✅ Added chief_admin to database enum');
//     } catch (e) {
//       // Ignore error: "duplicate value" means it was already added.
//     }

//     const userRepository = dataSource.getRepository('User');
//     const adminEmail = 'chiefadmin@eduspacemartekplace.com';
//     const plainPassword = 'admin@123';

//     const adminExists = await userRepository.findOne({
//       where: { email: adminEmail }
//     });

//     if (adminExists) {
//       console.log('✅ Chief Admin already exists');
//       return;
//     }

//     const salt = await bcrypt.genSalt();
//     const hashedPassword = await bcrypt.hash(plainPassword, salt);

//     const admin = userRepository.create({
//       name: 'Chief Admin',
//       email: adminEmail,
//       password: hashedPassword,
//       role: 'chief_admin' as any,
//       isVerified: true,
//       phone: '0000000000',
//       dob: '2000-01-01',
//       gender: 'N/A',
//       permissions: ['ALL']
//     });

//     await userRepository.save(admin);
//     console.log(`✅ Chief Admin created: ${adminEmail} / ${plainPassword}`);

//   } catch (error) {
//     console.log('Error creating chief admin:', error.message);
//   }
// }
// // ========== END OF UPDATED FUNCTION ==========

// bootstrap();

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { json, urlencoded } from 'express';
// import { NestExpressApplication } from '@nestjs/platform-express';
// import { join } from 'path';

// async function bootstrap() {
//   // Create Nest app
//   const app = await NestFactory.create<NestExpressApplication>(AppModule);

//   // --- Body parser limits ---
//   app.use(json({
//     limit: '250mb',
//     verify: (req: any, res, buf) => {
//       req.rawBody = buf;
//     },
//   }));
//   app.use(urlencoded({ extended: true, limit: '250mb' }));

//   // --- Serve uploads folder ---
//   app.useStaticAssets(join(__dirname, '..', 'uploads'), {
//     prefix: '/uploads/',
//   });

//   // --- CORS configuration ---
//   app.enableCors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
//     credentials: true,
//     allowedHeaders: ['Content-Type', 'Authorization'],
//   });

//   // --- Start server with dynamic port for Render ---
//   const PORT = process.env.PORT || 3001;
//   await app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// }

// bootstrap();


// // src/main.ts
// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { json, urlencoded } from 'express';
// // 👇 1. Add these imports
// import { NestExpressApplication } from '@nestjs/platform-express';
// import { join } from 'path';
// import * as bcrypt from 'bcrypt';

// async function bootstrap() {
//   // 👇 2. Change this line to use NestExpressApplication
//   const app = await NestFactory.create<NestExpressApplication>(AppModule);

//   // // V V V V V TEMPORARY CODE TO HASH A PASSWORD V V V V V
//   const plainPassword = 'SuperSecretAdmin123!';
//   const salt = await bcrypt.genSalt();
//   const hashedPassword = await bcrypt.hash(plainPassword, salt);
//   console.log('--- ADMIN HASHED PASSWORD (COPY THIS) ---');
//   console.log(hashedPassword);
//   console.log('-----------------------------------------');
//   // // ^ ^ ^ ^ ^ END OF TEMPORARY CODE ^ ^ ^ ^ ^

//   // This is the fix for large file uploads (your existing code is good)
//   app.use(json({
//     limit: '250mb',
//     verify: (req: any, res, buf) => {
//       req.rawBody = buf;
//     },
//   }));
//   app.use(urlencoded({ extended: true, limit: '250mb' }));

//   // 👇 3. Add this line to make your uploads folder public
//   app.useStaticAssets(join(__dirname, '..', 'uploads'), {
//     prefix: '/uploads/',
//   });

//   // This is for your frontend to communicate with your backend (your existing code is good)
//   app.enableCors({
//     origin: 'http://localhost:3000', // Note: This should match your frontend URL
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
//     credentials: true,
//     allowedHeaders: ['Content-Type', 'Authorization'],
//   });

//   await app.listen(process.env.PORT || 3001);
// }
// bootstrap();

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