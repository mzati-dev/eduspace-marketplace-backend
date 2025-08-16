import { IsArray, IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PurchaseItemDto {
    @IsUUID()
    @IsNotEmpty()
    lessonId: string;
}

export class CreatePurchaseDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PurchaseItemDto)
    items: PurchaseItemDto[];
}