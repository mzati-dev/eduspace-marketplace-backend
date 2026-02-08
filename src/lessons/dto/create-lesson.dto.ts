import { IsString, IsNumber, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLessonDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsString()
    @IsNotEmpty()
    form: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Type(() => Number)
    price: number;

    // --- CHANGED SECTIONS ---

    // 1. videoId (REQUIRED)
    @IsString()
    @IsNotEmpty()
    videoId: string;

    // 2. videoUrl (OPTIONAL but highly recommended)
    // We added this back so the DB can save the full link!
    @IsString()
    @IsOptional()
    videoUrl?: string;

    // --- END CHANGED SECTIONS ---

    @IsString()
    @IsOptional()
    textContent: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Type(() => Number)
    durationMinutes: number;
}

export class UpdateLessonDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    subject?: string;

    @IsString()
    @IsOptional()
    form?: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    price?: number;

    @IsString()
    @IsOptional()
    videoId?: string;

    // Add this here too, just in case you edit the video later
    @IsString()
    @IsOptional()
    videoUrl?: string;

    @IsString()
    @IsOptional()
    textContent?: string;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    durationMinutes?: number;
}

// import { IsString, IsNumber, IsNotEmpty, IsOptional, Min } from 'class-validator';
// import { Type } from 'class-transformer';

// export class CreateLessonDto {
//     @IsString()
//     @IsNotEmpty()
//     title: string;

//     @IsString()
//     @IsOptional()
//     description: string;

//     @IsString()
//     @IsNotEmpty()
//     subject: string;

//     @IsString()
//     @IsNotEmpty()
//     form: string;

//     @IsNumber()
//     @IsNotEmpty()
//     @Min(0)
//     @Type(() => Number)
//     price: number;

//     // --- CHANGED SECTIONS ---

//     // 1. DELETE: videoFile (We don't upload files to this server anymore)
//     // @IsOptional()
//     // videoFile?: any;

//     // 2. DELETE: videoUrl (We don't need this, we use videoId)
//     // @IsString()
//     // @IsOptional()
//     // videoUrl?: string;

//     // 3. ADD: videoId (REQUIRED)
//     // This comes from the frontend after they finish uploading to Bunny
//     @IsString()
//     @IsNotEmpty()
//     videoId: string;

//     // --- END CHANGED SECTIONS ---

//     @IsString()
//     @IsOptional()
//     textContent: string;

//     @IsNumber()
//     @IsNotEmpty()
//     @Min(1)
//     @Type(() => Number)
//     durationMinutes: number;
// }

// export class UpdateLessonDto {
//     @IsString()
//     @IsOptional()
//     title?: string;

//     @IsString()
//     @IsOptional()
//     description?: string;

//     @IsString()
//     @IsOptional()
//     subject?: string;

//     @IsString()
//     @IsOptional()
//     form?: string;

//     @IsNumber()
//     @IsOptional()
//     @Min(0)
//     @Type(() => Number)
//     price?: number;

//     // --- CHANGED SECTIONS ---

//     // 1. DELETE: videoFile
//     // @IsOptional()
//     // videoFile?: any;

//     // 2. ADD: videoId (OPTIONAL)
//     // Allows the teacher to replace the video with a new one
//     @IsString()
//     @IsOptional()
//     videoId?: string;

//     // --- END CHANGED SECTIONS ---

//     @IsString()
//     @IsOptional()
//     textContent?: string;

//     @IsNumber()
//     @IsOptional()
//     @Type(() => Number)
//     durationMinutes?: number;
// }

// import { IsString, IsNumber, IsNotEmpty, IsOptional, Min } from 'class-validator';
// import { Type } from 'class-transformer';

// export class CreateLessonDto {
//     @IsString()
//     @IsNotEmpty()
//     title: string;

//     @IsString()
//     // @IsNotEmpty()
//     @IsOptional()
//     description: string;

//     @IsString()
//     @IsNotEmpty()
//     subject: string;

//     @IsString()
//     @IsNotEmpty()
//     form: string;

//     @IsNumber()
//     @IsNotEmpty()
//     @Min(0)
//     @Type(() => Number)
//     price: number;

//     @IsOptional()
//     videoFile?: any; // This will be handled by the file interceptor

//     @IsString()
//     @IsOptional() // Make videoUrl optional if you're allowing file uploads
//     videoUrl?: string;

//     @IsString()
//     // @IsNotEmpty()
//     @IsOptional()
//     textContent: string;

//     @IsNumber()
//     @IsNotEmpty()
//     @Min(1)
//     @Type(() => Number)
//     durationMinutes: number;
// }

// export class UpdateLessonDto {
//     @IsString()
//     @IsOptional()
//     title?: string;

//     @IsString()
//     @IsOptional()
//     description?: string;

//     @IsString()
//     @IsOptional()
//     subject?: string;

//     @IsString()
//     @IsOptional()
//     form?: string;

//     @IsNumber()
//     @IsOptional()
//     @Type(() => Number)
//     price?: number;

//     @IsOptional()
//     videoFile?: any; // Add this for file uploads in updates

//     @IsString()
//     @IsOptional()
//     videoUrl?: string;

//     @IsString()
//     @IsOptional()
//     textContent?: string;

//     @IsNumber()
//     @IsOptional()
//     @Type(() => Number)
//     durationMinutes?: number;
// }