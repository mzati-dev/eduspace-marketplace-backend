import { IsString, IsArray, IsIn, IsNotEmpty, MinLength } from 'class-validator';

// This DTO defines the fields REQUIRED to create a new profile.
export class CreateTutorProfileDto {
    @IsString()
    @IsNotEmpty()
    @IsIn(['Mr.', 'Mrs.', 'Ms.', 'Dr.'])
    readonly title: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    readonly name: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(20)
    readonly bio: string;

    @IsArray()
    @IsNotEmpty()
    @IsString({ each: true })
    readonly subjects: string[];
}