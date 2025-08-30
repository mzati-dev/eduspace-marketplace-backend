// src/auth/dto/register.dto.ts
import { IsString, IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
import { UserRole } from 'src/users/entities/user.entity';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsNotEmpty()
    dob: string;

    @IsString()
    @IsNotEmpty()
    gender: string;

    @IsEnum(UserRole)
    role: UserRole;
}