import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateRatingDto {
    @IsUUID()
    @IsNotEmpty()
    lessonId: string;

    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;

    @IsString()
    @IsOptional()
    comment?: string;
}