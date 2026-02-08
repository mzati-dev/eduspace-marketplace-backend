import { memoryStorage } from 'multer';
import { extname } from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';
import 'multer'; // 👈 This helps resolve the 'Express' namespace error

export const multerOptions = {
    // 200MB file size limit
    limits: {
        fileSize: 200 * 1024 * 1024,
    },
    // Check file type
    fileFilter: (req: any, file: any, cb: any) => {
        if (file.mimetype.match(/\/(mp4|mpeg|quicktime|x-ms-wmv)$/)) {
            cb(null, true);
        } else {
            cb(new HttpException(`Unsupported file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false);
        }
    },
    // 🔥 SWITCHED TO MEMORY STORAGE:
    // This solves the 'mkdirSync' permission errors on Render
    // and is better for apps using external storage like Bunny.net
    storage: memoryStorage(),
};



// import { diskStorage } from 'multer';
// import { extname, join } from 'path';
// import { existsSync, mkdirSync } from 'fs';
// import { HttpException, HttpStatus } from '@nestjs/common';

// export const multerOptions = {
//     // 200MB file size limit
//     limits: {
//         fileSize: 200 * 1024 * 1024,
//     },
//     // Check file type
//     fileFilter: (req: any, file: any, cb: any) => {
//         if (file.mimetype.match(/\/(mp4|mpeg|quicktime|x-ms-wmv)$/)) {
//             cb(null, true);
//         } else {
//             cb(new HttpException(`Unsupported file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false);
//         }
//     },
//     // Storage properties
//     storage: diskStorage({
//         destination: (req: any, file: any, cb: any) => {
//             try {
//                 const destinationPath = join(process.cwd(), 'uploads', 'videos');

//                 if (!existsSync(destinationPath)) {
//                     mkdirSync(destinationPath, { recursive: true });
//                 }

//                 cb(null, destinationPath);
//             } catch (error) {
//                 cb(error, '');
//             }
//         },
//         filename: (req: any, file: any, cb: any) => {
//             const randomName = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
//             cb(null, `${randomName}${extname(file.originalname)}`);
//         },
//     }),
// };