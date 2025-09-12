import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class CreateSupportmoduleDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    subject: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    message: string;
}


