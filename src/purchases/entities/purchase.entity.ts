import { Lesson } from 'src/lessons/entities/lesson.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
// import { User } from '../users/user.entity';
// import { Lesson } from '../lessons/lesson.entity';

@Entity()
export class Purchase {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    studentId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'studentId' })
    student: User;

    @ManyToOne(() => Lesson, (lesson) => lesson.purchases)
    @JoinColumn({ name: 'lessonId' })
    lesson: Lesson;

    @Column()
    lessonId: string; // Needed for where: { lessonId }

    @CreateDateColumn()
    createdAt: Date; // Auto timestamp instead of purchaseDate

    // @Column({ type: 'decimal', precision: 10, scale: 2 })
    // amount: number;
    // This is the correct way to define the price column
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    // @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    // purchaseDate: Date;


    @ManyToOne(() => User, user => user.purchases)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;



    // @Column({ type: 'int', default: 0 })
    // salesCount: number;
    // @ManyToOne(() => Lesson, lesson => lesson.purchases)
    // @JoinColumn({ name: 'lessonId' })
    // lesson: Lesson;

    // @Column()
    // lessonId: string;
}

// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
// import { Lesson } from '../../lessons/entities/lesson.entity';
// import { User } from '../../users/entities/user.entity';

// @Entity()
// export class Purchase {
//     @PrimaryGeneratedColumn('uuid')
//     id: string;

//     @Column()
//     studentId: string;

//     @ManyToOne(() => User)
//     @JoinColumn({ name: 'studentId' })
//     student: User;

//     @ManyToOne(() => Lesson, (lesson) => lesson.purchases)
//     @JoinColumn({ name: 'lessonId' })
//     lesson: Lesson;

//     @Column()
//     lessonId: string; // Needed for where: { lessonId }

//     @CreateDateColumn()
//     createdAt: Date; // Auto timestamp instead of purchaseDate
// }
