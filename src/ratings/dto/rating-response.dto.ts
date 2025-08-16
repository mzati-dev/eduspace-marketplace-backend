export class RatingResponseDto {
    id: string;
    rating: number;
    comment: string;
    createdAt: Date;
    lessonId: string;
    userId: string;
    userName: string;

    constructor(rating: any) {
        this.id = rating.id;
        this.rating = rating.rating;
        this.comment = rating.comment;
        this.createdAt = rating.createdAt;
        this.lessonId = rating.lessonId;
        this.userId = rating.user.id;
        this.userName = rating.user.name;
    }
}