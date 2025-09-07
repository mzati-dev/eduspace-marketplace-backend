import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'; // Assuming you have this

// Allow connections from your frontend's URL
@WebSocketGateway({ cors: { origin: 'http://localhost:3000' } })
export class ChatGateway {
    @WebSocketServer()
    server: Server;

    constructor(private readonly chatService: ChatService) { }

    // When a user connects, they join a private room named after their own User ID.
    // This ensures they only receive messages intended for them.
    @SubscribeMessage('joinRoom')
    handleJoinRoom(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
        client.join(userId);
    }

    // When a user sends a message from the frontend
    @SubscribeMessage('sendMessage')
    async handleMessage(
        @MessageBody() data: { authorId: string; conversationId: string; content: string },
    ): Promise<void> {
        // 1. Save the new message to the database
        const message = await this.chatService.createMessage(data);

        // 2. Get the conversation details, including all participants
        const conversation = await this.chatService.getConversationWithParticipants(data.conversationId);

        // 3. Send the new message to every participant in the conversation
        //    by emitting to their private rooms.
        conversation.participants.forEach(participant => {
            this.server.to(participant.id).emit('newMessage', message);
        });
    }
}