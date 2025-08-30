import { IsNumber, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateBankPaymentDto {
    /**
     * The price of the lesson the student wants to buy.
     * e.g., 1500
     */
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    /**
     * The email of the student making the purchase.
     * This is used to identify the user and update their records.
     * e.g., "student@example.com"
     */
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString() // <-- Add this decorator
    @IsNotEmpty() // <-- Add this decorator
    lessonId: string; // <-- Add this property
}