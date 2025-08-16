// src/users/entities/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Purchase } from '../../purchases/entities/purchase.entity';
import { Rating } from 'src/ratings/entities/rating.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';


export enum UserRole {
    STUDENT = 'student',
    TEACHER = 'teacher',
}
@Entity()

export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    phone: string;

    @Column()
    dob: string;

    @Column()
    gender: string;

    @Column({
        type: 'enum',
        enum: UserRole, // ⭐ Use the new enum here
    })
    role: UserRole; // ⭐ Use the enum as the type here

    @Column({ default: false })
    isVerified: boolean;

    // 🔹 Inverse side of Lesson.teacher
    @OneToMany(() => Lesson, (lesson) => lesson.teacher)
    lessons: Lesson[];

    // 🔹 Inverse side of Purchase.student
    @OneToMany(() => Purchase, (purchase) => purchase.student)
    purchases: Purchase[];

    @OneToMany(() => Rating, rating => rating.user)
    ratingsGiven: Rating[];

    @OneToMany(() => Rating, rating => rating.user)
    ratings: Rating[];
}

// // src/users/entities/user.entity.ts
// import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
// // import { Lesson } from '../../lessons/entities/lesson.entity';
// import { Purchase } from '../../purchases/entities/purchase.entity';
// import { Rating } from 'src/ratings/entities/rating.entity';
// import { Lesson } from 'src/lessons/entities/lesson.entity';

// @Entity()

// export enum UserRole {
//   STUDENT = 'student',
//   TEACHER = 'teacher',
// }
// export class User {
//     @PrimaryGeneratedColumn('uuid')
//     id: string;

//     @Column()
//     name: string;

//     @Column({ unique: true })
//     email: string;

//     @Column()
//     password: string;

//     @Column()
//     phone: string;

//     @Column()
//     dob: string;

//     @Column()
//     gender: string;

//     @Column({ type: 'enum', enum: ['student', 'teacher'] })
//     role: 'student' | 'teacher';

//     @Column({ default: false })
//     isVerified: boolean;

//     // 🔹 Inverse side of Lesson.teacher
//     @OneToMany(() => Lesson, (lesson) => lesson.teacher)
//     lessons: Lesson[];

//     // 🔹 Inverse side of Purchase.student
//     @OneToMany(() => Purchase, (purchase) => purchase.student)
//     purchases: Purchase[];

//     //     @OneToMany(() => Lesson, lesson => lesson.teacher)
//     //   lessons: Lesson[];

//     @OneToMany(() => Rating, rating => rating.user)
//     ratingsGiven: Rating[];

//     @OneToMany(() => Rating, rating => rating.user)
//     ratings: Rating[];
// }
