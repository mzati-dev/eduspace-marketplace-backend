import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Conversation } from './conversation.entity';

@Entity()
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // This is the property that was missing
    @Column('text')
    content: string;

    @CreateDateColumn()
    timestamp: Date;

    @ManyToOne(() => User, { eager: true }) // eager loads the author with the message
    author: User;

    @ManyToOne(() => Conversation, conv => conv.messages)
    conversation: Conversation;
}


// import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
// import { User } from 'src/users/entities/user.entity';
// import { Conversation } from './conversation.entity';

// @Entity()
// export class Message {
//     @PrimaryGeneratedColumn('uuid')
//     id: string;

//     @Column('text')
//     content: string;

//     @CreateDateColumn()
//     timestamp: Date;

//     @ManyToOne(() => User)
//     author: User;

//     @ManyToOne(() => Conversation, conv => conv.messages)
//     conversation: Conversation;
// }