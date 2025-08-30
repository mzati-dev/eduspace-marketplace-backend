import { IsString, IsNumber, IsEmail, IsNotEmpty, IsIn } from 'class-validator';

export class CreatePaymentDto {
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsString()
    @IsNotEmpty()
    mobile: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString() // <-- Add this decorator
    @IsNotEmpty() // <-- Add this decorator
    lessonId: string; // <-- Add this property

    @IsString()
    @IsNotEmpty()
    @IsIn(['airtel', 'mpamba'])
    provider: 'airtel' | 'mpamba';
}