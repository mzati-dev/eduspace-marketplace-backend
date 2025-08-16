// import { Lesson } from '../lessons/lesson.entity';

export class PurchaseResponseDto {
    id: string;
    amount: number;
    purchaseDate: Date;
    lesson: {
        id: string;
        title: string;
        price: number;
    };

    constructor(purchase: any) {
        this.id = purchase.id;
        this.amount = purchase.amount;
        this.purchaseDate = purchase.purchaseDate;
        this.lesson = {
            id: purchase.lesson.id,
            title: purchase.lesson.title,
            price: purchase.lesson.price,
        };
    }
}