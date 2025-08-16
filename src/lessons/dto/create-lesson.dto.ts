import { IsString, IsNumber, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLessonDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    // @IsNotEmpty()
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

    @IsOptional()
    videoFile?: any; // This will be handled by the file interceptor

    @IsString()
    @IsOptional() // Make videoUrl optional if you're allowing file uploads
    videoUrl?: string;

    @IsString()
    // @IsNotEmpty()
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
    @Type(() => Number)
    price?: number;

    @IsOptional()
    videoFile?: any; // Add this for file uploads in updates

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