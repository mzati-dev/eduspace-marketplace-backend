import { Lesson } from 'src/lessons/entities/lesson.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
// import { Lesson } from '../lessons/lesson.entity';
// import { User } from '../users/user.entity';

@Entity()
export class Rating {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    rating: number;

    @Column({ type: 'text', nullable: true })
    comment: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @ManyToOne(() => Lesson, lesson => lesson.ratings)
    @JoinColumn({ name: 'lessonId' })
    lesson: Lesson;

    @Column()
    lessonId: string;

    @ManyToOne(() => User, user => user.ratings)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;
}