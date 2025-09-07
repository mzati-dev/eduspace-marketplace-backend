import { Controller, Get, Post, Body, Param, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateConversationDto } from './dto/create-conversation.dto';

// This decorator protects all routes in this controller
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  /**
   * @route   POST /chat/conversations
   * @desc    Creates a new conversation with another user
   * @access  Private (requires login)
   */
  @Post('conversations')
  @HttpCode(HttpStatus.CREATED)
  createConversation(@Req() req, @Body() createConversationDto: CreateConversationDto) {
    // req.user.id is securely taken from the JWT token
    const creatorId = req.user.id;
    return this.chatService.createConversation(creatorId, createConversationDto.participantId);
  }

  /**
   * @route   GET /chat/conversations
   * @desc    Gets all conversations for the logged-in user
   * @access  Private (requires login)
   */
  @Get('conversations')
  getConversationsForUser(@Req() req) {
    // req.user.id is securely taken from the JWT token
    return this.chatService.getConversationsForUser(req.user.id);
  }

  /**
   * @route   GET /chat/conversations/:id/messages
   * @desc    Gets all messages for a specific conversation
   * @access  Private (requires login)
   */
  @Get('conversations/:id/messages')
  getMessagesForConversation(@Param('id') id: string) {
    // Note: A security check to ensure the logged-in user is part of this
    // conversation should be added in the service for production apps.
    return this.chatService.getMessagesForConversation(id);
  }
}