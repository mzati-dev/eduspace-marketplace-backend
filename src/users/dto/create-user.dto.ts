// src/users/dto/create-user.dto.ts

import { IsString, IsEmail, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password?: string; // It's here for creation, but we don't update it in the profile form

    @IsString()
    @IsOptional()
    phone?: string;

    @IsDateString()
    @IsOptional()
    dob?: string;

    @IsString()
    @IsOptional()
    gender?: string;
}