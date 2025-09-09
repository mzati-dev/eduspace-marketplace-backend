import { PartialType } from '@nestjs/mapped-types';

import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { CreateTutorProfileDto } from './create-profile.dto';

// PartialType makes all fields from the Create DTO optional.
// This is perfect for PATCH requests.
export class UpdateTutorProfileDto extends PartialType(CreateTutorProfileDto) {
    @IsOptional()
    @IsNumber()
    readonly monthlyRate?: number;

    @IsOptional()
    @IsBoolean()
    readonly isAvailableForNewStudents?: boolean;
}