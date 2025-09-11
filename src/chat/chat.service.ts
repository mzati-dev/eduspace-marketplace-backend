import { Injectable, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { User, UserRole } from 'src/users/entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation) private convRepo: Repository<Conversation>,
    @InjectRepository(Message) private msgRepo: Repository<Message>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) { }

  /**
   * Creates a new conversation between two users or finds the existing one.
   * Includes role-based logic to control who can start a chat.
   */
  async createConversation(creatorId: string, participantId: string): Promise<Conversation> {
    const creator = await this.userRepo.findOneBy({ id: creatorId });
    const participant = await this.userRepo.findOneBy({ id: participantId });

    if (!creator || !participant) {
      throw new NotFoundException('One or both users not found.');
    }

    // Role-based logic
    if (creator.role === UserRole.STUDENT && participant.role !== UserRole.TEACHER) {
      throw new ForbiddenException('Students can only initiate conversations with teachers.');
    }
    if (creator.role === UserRole.TEACHER && participant.role !== UserRole.STUDENT) {
      throw new ForbiddenException('Teachers can only initiate conversations with students.');
    }

    // Check if a conversation between these two already exists
    const existingConversation = await this.convRepo.createQueryBuilder('conversation')
      .innerJoin('conversation.participants', 'user1')
      .innerJoin('conversation.participants', 'user2')
      .where('user1.id = :creatorId', { creatorId })
      .andWhere('user2.id = :participantId', { participantId })
      .getOne();

    if (existingConversation) {
      return existingConversation;
    }

    // If not, create a new one
    const newConversation = this.convRepo.create({
      participants: [creator, participant],
    });

    return this.convRepo.save(newConversation);
  }

  /**
   * Gets all conversations for a specific user, ordered by the most recently active.
   */
  // async getConversationsForUser(userId: string): Promise<Conversation[]> {
  //   return this.convRepo
  //     .createQueryBuilder('conversation')
  //     .innerJoin('conversation.participants', 'user', 'user.id = :userId', { userId })
  //     .leftJoinAndSelect('conversation.participants', 'participants')
  //     .orderBy('conversation.updatedAt', 'DESC')
  //     .getMany();

  // }

  // ================= FIX IS IN THIS METHOD =================
  /**
   * Gets all conversations for a user, including the unread message count for each.
   */
  async getConversationsForUser(userId: string): Promise<any[]> {
    // 1. Fetch all conversations for the user and store them in a variable.
    const conversations = await this.convRepo
      .createQueryBuilder('conversation')
      .innerJoin('conversation.participants', 'user', 'user.id = :userId', { userId })
      .leftJoinAndSelect('conversation.participants', 'participants')
      .orderBy('conversation.updatedAt', 'DESC')
      .getMany();

    // 2. Map over the fetched conversations to calculate unread counts.
    const conversationsWithUnreadCounts = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await this.msgRepo.count({
          where: {
            conversation: { id: conv.id },
            isRead: false,
            author: { id: Not(userId) }, // Count messages not sent by the current user
          },
        });
        return { ...conv, unreadCount };
      })
    );

    // 3. Return the new array that includes the unread counts.
    return conversationsWithUnreadCounts;
  }
  // ================= END OF FIX =================


  // --- ADD THIS METHOD ---
  /**
   * Marks all messages in a conversation as read for a specific user.
   */
  async markConversationAsRead(conversationId: string, userId: string): Promise<{ updated: number }> {
    const conversation = await this.convRepo.findOne({
      where: { id: conversationId },
      relations: ['participants']
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found.');
    }

    // Security check: ensure the user is part of the conversation
    if (!conversation.participants.some(p => p.id === userId)) {
      throw new UnauthorizedException('You are not a participant in this conversation.');
    }

    // Update messages that are unread and not authored by the current user
    const result = await this.msgRepo.update(
      {
        conversation: { id: conversationId },
        author: { id: Not(userId) },
        isRead: false,
      },
      { isRead: true },
    );

    return { updated: result.affected || 0 };
  }

  // --- ADD THIS METHOD ---
  /**
   * Gets the total count of unread messages for a user across all conversations.
   */
  async getTotalUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.msgRepo.count({
      where: {
        // Find messages in conversations where the user is a participant
        conversation: { participants: { id: userId } },
        // Message must not be from the user themselves
        author: { id: Not(userId) },
        // And it must be unread
        isRead: false,
      },
    });
    return { count };
  }

  /**
   * Gets all messages for a specific conversation.
   */
  async getMessagesForConversation(conversationId: string): Promise<Message[]> {
    return this.msgRepo.find({
      where: { conversation: { id: conversationId } },
      relations: ['author'],
      order: { timestamp: 'ASC' },
    });
  }

  /**
   * Creates a new message and saves it to the database.
   * Also updates the conversation's 'updatedAt' timestamp.
   */
  async createMessage(data: { authorId: string; conversationId: string; content: string }): Promise<Message> {
    const author = await this.userRepo.findOneBy({ id: data.authorId });
    if (!author) throw new NotFoundException('Author not found');

    const conversation = await this.convRepo.findOneBy({ id: data.conversationId });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const newMessage = this.msgRepo.create({
      content: data.content,
      author,
      conversation,
    });

    // This makes sure the conversation is marked as recently active
    await this.convRepo.update(data.conversationId, { updatedAt: new Date() });

    return this.msgRepo.save(newMessage);
  }

  /**
   * Gets a single conversation along with its participants.
   * Includes a check to handle cases where the conversation isn't found.
   */
  async getConversationWithParticipants(conversationId: string): Promise<Conversation> {
    const conversation = await this.convRepo.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
    }
    return conversation;
  }
}

// import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Conversation } from './entities/conversation.entity';
// import { Message } from './entities/message.entity';
// import { User } from 'src/users/entities/user.entity';

// @Injectable()
// export class ChatService {
//   constructor(
//     @InjectRepository(Conversation) private convRepo: Repository<Conversation>,
//     @InjectRepository(Message) private msgRepo: Repository<Message>,
//     @InjectRepository(User) private userRepo: Repository<User>,
//   ) { }

//   async getConversationsForUser(userId: string): Promise<Conversation[]> {
//     return this.convRepo
//       .createQueryBuilder('conversation')
//       .innerJoin('conversation.participants', 'user', 'user.id = :userId', { userId })
//       .leftJoinAndSelect('conversation.participants', 'participants')
//       .getMany();
//   }

//   async getMessagesForConversation(conversationId: string): Promise<Message[]> {
//     return this.msgRepo.find({
//       where: { conversation: { id: conversationId } },
//       relations: ['author'],
//       order: { timestamp: 'ASC' },
//     });
//   }

//   async createMessage(data: { authorId: string; conversationId: string; content: string }): Promise<Message> {
//     const author = await this.userRepo.findOneBy({ id: data.authorId });
//     if (!author) throw new NotFoundException('Author not found');

//     const conversation = await this.convRepo.findOneBy({ id: data.conversationId });
//     if (!conversation) throw new NotFoundException('Conversation not found');

//     const newMessage = this.msgRepo.create({
//       content: data.content,
//       author,
//       conversation,
//     });

//     return this.msgRepo.save(newMessage);
//   }

//   // --- START: CORRECTED CODE ---
//   async getConversationWithParticipants(conversationId: string): Promise<Conversation> {
//     const conversation = await this.convRepo.findOne({
//       where: { id: conversationId },
//       relations: ['participants'],
//     });

//     // This check handles the 'null' case
//     if (!conversation) {
//       throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
//     }

//     // If we get here, TypeScript knows 'conversation' is not null
//     return conversation;
//   }
//   // --- END: CORRECTED CODE ---
// }