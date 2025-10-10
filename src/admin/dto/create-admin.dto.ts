import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional, IsArray } from 'class-validator';
import { UserRole } from 'src/users/entities/user.entity';

export class CreateAdminUserDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    phone: string;

    @IsNotEmpty()
    @IsString()
    dob: string;

    @IsNotEmpty()
    @IsString()
    gender: string;

    @IsNotEmpty()
    @IsString()
    password;

    @IsEnum(UserRole)
    role: UserRole;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    permissions?: string[];
}