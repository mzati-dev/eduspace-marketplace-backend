import { User } from '../../users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';

@Entity('tutor_profiles')
export class TutorProfile {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ length: 10 })
    title: string;

    @Column({ length: 255 })
    name: string;

    @Column('text')
    bio: string;

    @Column('simple-array')
    subjects: string[];

    @Column({ type: 'int', nullable: true })
    monthlyRate: number;

    @Column({ default: true })
    isAvailableForNewStudents: boolean;
}