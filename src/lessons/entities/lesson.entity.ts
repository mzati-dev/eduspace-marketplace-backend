import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Rating } from 'src/ratings/entities/rating.entity';
import { Purchase } from 'src/purchases/entities/purchase.entity';

@Entity()
export class Lesson {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column()
    subject: string;

    @Column()
    form: string;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column({ nullable: true })
    videoUrl: string;

    @Column({ type: 'text', nullable: true })
    textContent: string;

    @Column({ default: 0 })
    durationMinutes: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @ManyToOne(() => User, user => user.lessons)
    @JoinColumn({ name: 'teacherId' })
    teacher: User;

    @Column({ nullable: false }) // Add explicit teacherId column
    teacherId: string;

    @OneToMany(() => Rating, rating => rating.lesson)
    ratings: Rating[];

    @Column({ type: 'float', nullable: true })
    averageRating: number | null;

    @OneToMany(() => Purchase, (purchase) => purchase.lesson)
    purchases: Purchase[];

}

