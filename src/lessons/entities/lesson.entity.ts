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

    @Column({ type: 'int', default: 0 })
    salesCount: number;
}

// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
// import { User } from 'src/users/entities/user.entity';
// import { Rating } from 'src/ratings/entities/rating.entity';
// import { Purchase } from 'src/purchases/entities/purchase.entity';

// @Entity()
// export class Lesson {
//     @PrimaryGeneratedColumn('uuid')
//     id: string;

//     @Column()
//     title: string;

//     @Column({ type: 'text', nullable: true })
//     description: string;

//     @Column()
//     subject: string;

//     @Column()
//     form: string;

//     @Column('decimal', { precision: 10, scale: 2 })
//     price: number;

//     @Column({ nullable: true })
//     videoUrl: string;

//     @Column({ type: 'text', nullable: true })
//     textContent: string;

//     @Column({ default: 0 })
//     durationMinutes: number;

//     @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
//     createdAt: Date;

//     @ManyToOne(() => User, user => user.lessons)
//     @JoinColumn({ name: 'teacherId' })
//     teacher: User;

//     @Column()
//     teacherName: string;

//     @OneToMany(() => Rating, rating => rating.lesson)
//     ratings: Rating[];

//     @Column({ type: 'float', nullable: true })
//     averageRating: number | null;

//     @OneToMany(() => Purchase, (purchase) => purchase.lesson)
//     purchases: Purchase[];
// }


// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
// import { User } from 'src/users/entities/user.entity';
// import { Rating } from 'src/ratings/entities/rating.entity';
// import { Purchase } from 'src/purchases/entities/purchase.entity';

// @Entity()
// export class Lesson {
//     @PrimaryGeneratedColumn('uuid')
//     id: string;

//     @Column()
//     title: string;

//     @Column({ type: 'text', nullable: true })
//     description: string;

//     @Column()
//     subject: string;

//     @Column()
//     form: string;

//     @Column('decimal', { precision: 10, scale: 2 })
//     price: number;

//     @Column({ nullable: true })
//     videoUrl: string;

//     @Column({ type: 'text', nullable: true })
//     textContent: string;

//     @Column({ default: 0 })
//     durationMinutes: number;

//     @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
//     createdAt: Date;

//     // This is the TypeORM relationship. It automatically creates a `teacherId` foreign key.
//     @ManyToOne(() => User, user => user.lessons)
//     @JoinColumn({ name: 'teacherId' })
//     teacher: User;

//     // This column holds the teacher's name directly, which is needed by your database.
//     @Column()
//     teacherName: string;

//     @OneToMany(() => Rating, rating => rating.lesson)
//     ratings: Rating[];

//     @Column({ type: 'float', nullable: true })
//     averageRating: number | null;

//     @OneToMany(() => Purchase, (purchase) => purchase.lesson)
//     purchases: Purchase[];
// }


// // src/lessons/entities/lesson.entity.ts
// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
// import { User } from 'src/users/entities/user.entity';
// import { Rating } from 'src/ratings/entities/rating.entity';
// import { Purchase } from 'src/purchases/entities/purchase.entity';

// @Entity()
// export class Lesson {
//     @PrimaryGeneratedColumn('uuid')
//     id: string;

//     @Column()
//     title: string;

//     @Column({ type: 'text', nullable: true })
//     description: string;

//     @Column()
//     subject: string;

//     @Column()
//     form: string;

//     @Column('decimal', { precision: 10, scale: 2 })
//     price: number;

//     @Column({ nullable: true })
//     videoUrl: string;

//     @Column({ type: 'text', nullable: true })
//     textContent: string;

//     @Column({ default: 0 })
//     durationMinutes: number;

//     @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
//     createdAt: Date;

//     // ⭐ This is the correct way to define the foreign key relationship
//     // TypeORM automatically creates a `teacherId` column for you.
//     @ManyToOne(() => User, user => user.lessons)
//     @JoinColumn({ name: 'teacherId' })
//     teacher: User;

//     @Column()
//     teacherName: string;

//     @OneToMany(() => Rating, rating => rating.lesson)
//     ratings: Rating[];

//     @Column({ type: 'float', nullable: true })
//     averageRating: number | null;

//     @OneToMany(() => Purchase, (purchase) => purchase.lesson)
//     purchases: Purchase[];
// }

// // import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
// // // import { User } from '../auth/user.entity';
// // // import { Rating } from '../ratings/rating.entity';
// // import { User } from 'src/users/entities/user.entity';
// // import { Rating } from 'src/ratings/entities/rating.entity';
// // import { Purchase } from 'src/purchases/entities/purchase.entity';

// // @Entity()
// // export class Lesson {
// //     @PrimaryGeneratedColumn('uuid')
// //     id: string;

// //     @Column()
// //     title: string;

// //     @Column('text')
// //     description: string;

// //     @Column()
// //     subject: string;

// //     @Column()
// //     form: string;

// //     @Column('decimal', { precision: 10, scale: 2 })
// //     price: number;

// //     @Column()
// //     videoUrl: string;

// //     @Column('text')
// //     textContent: string;

// //     @Column({ default: 0 })
// //     durationMinutes: number;

// //     @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
// //     createdAt: Date;

// //     @ManyToOne(() => User, user => user.lessons)
// //     @JoinColumn({ name: 'teacherId' })
// //     teacher: User;

// //     @Column()
// //     teacherId: string;

// //     @OneToMany(() => Rating, rating => rating.lesson)
// //     ratings: Rating[];

// //     @Column({ type: 'float', nullable: true })
// //     averageRating: number | null;


// //     @OneToMany(() => Purchase, (purchase) => purchase.lesson)
// //     purchases: Purchase[];

// // }