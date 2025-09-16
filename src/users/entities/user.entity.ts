// src/users/entities/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, CreateDateColumn } from 'typeorm';
import { Purchase } from '../../purchases/entities/purchase.entity';
import { Rating } from 'src/ratings/entities/rating.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { Conversation } from 'src/chat/entities/conversation.entity';


export enum UserRole {
    STUDENT = 'student',
    TEACHER = 'teacher',
    ADMIN = 'admin',
    // CHIEF_ADMIN = 'chief_admin',
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

    // --- START: NEW CODE FOR TEACHER PAYOUTS ---

    /**
     * The teacher's preferred payout method. Can be 'bank' or 'mobile_money'.
     * This will be NULL for students.
     */
    @Column({ type: 'varchar', nullable: true })
    payoutMethod: 'bank' | 'mobile_money' | null;

    /**
     * The full name on the teacher's bank or mobile money account.
     * This will be NULL for students.
     */
    @Column({ nullable: true })
    accountName: string;

    /**
     * The teacher's bank account number or mobile money number.
     * This will be NULL for students.
     */
    @Column({ nullable: true })
    accountNumber: string;

    /**
     * The unique ID for the teacher's bank (from PayChangu's /banks endpoint).
     * This will be NULL for students and for teachers who choose mobile money.
     */
    @Column({ nullable: true })
    bankUuid: string;

    /**
     * The unique ID for the teacher's mobile money provider (Airtel or Mpamba).
     * This will be NULL for students and for teachers who choose bank transfer.
     */
    @Column({ nullable: true })
    mobileMoneyOperatorRefId: string;

    // --- END: NEW CODE FOR TEACHER PAYOUTS ---

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

    @Column({ type: 'varchar', nullable: true, default: null })
    profileImageUrl: string;

    @CreateDateColumn()
    createdAt: Date;

    // // --- 2. ADD THIS NEW RELATIONSHIP ---
    // @ManyToMany(() => Conversation, conversation => conversation.participants)
    // conversations: Conversation[];
    // --- MODIFICATION IS HERE ---
    @ManyToMany(() => Conversation, conversation => conversation.participants, {
        // This line tells the database to automatically delete this user's
        // records from the join table when the user is deleted.
        onDelete: 'CASCADE',
    })
    conversations: Conversation[];
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
