// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Param,
//   Delete,
//   Query,
//   Patch,
//   NotFoundException,
//   BadRequestException,
//   HttpCode,
//   HttpStatus,
//   UseInterceptors,
//   UploadedFile,
// } from '@nestjs/common';
// import { MessagingService } from './messaging.service';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { diskStorage } from 'multer';
// import { extname } from 'path';
// import {
//   CreateConversationDto,
//   SendMessageDto,
//   ConversationDto,
//   MessageDto,
//   ConversationListDto,
//   MessageListDto,
//   MarkMessagesReadDto,
//   GetMessagesDto,
//   DeleteMessageDto,
// } from './dto/messaging.dto';
// import { ActiveUser } from 'src/auth/decorator/active-user.decorator';
// import { ActiveUserData } from 'src/auth/interfaces/active-user.data.interface';

// @Controller('messaging')

// export class MessagingController {
//   constructor(private readonly messagingService: MessagingService) {}
  
//   // File upload configuration is defined inline in the uploadFile method

//   /**
//    * Create a new conversation with specified participants
//    */
//   @Post('conversations')
//   async createConversation(
//     @ActiveUser() user: ActiveUserData,
//     @Body() createConversationDto: CreateConversationDto,
//   ): Promise<ConversationDto> {
//     return this.messagingService.createConversation(
//       user.sub, // Using sub from ActiveUserData which contains the user ID
//       createConversationDto,
//     );
//   }

//   /**
//    * Get a list of user's conversations
//    */
//   @Get('conversations')
//   async getConversations(
//     @ActiveUser() user: ActiveUserData,
//     @Query('offset') offset: number = 0,
//     @Query('limit') limit: number = 20,
//   ): Promise<ConversationListDto> {
//     return this.messagingService.getConversations(
//       user.sub,
//       offset,
//       limit,
//     );
//   }

//   /**
//    * Get a specific conversation by ID
//    */
//   @Get('conversations/:id')
//   async getConversation(
//     @ActiveUser() user: ActiveUserData,
//     @Param('id') id: number,
//   ): Promise<ConversationDto> {
//     // Use getConversations with a specific ID filter
//     const result = await this.messagingService.getConversations(
//       user.sub, 
//       0, 
//       1, 
//       [Number(id)]
//     );
    
//     if (result.conversations.length === 0) {
//       throw new NotFoundException('Conversation not found');
//     }
    
//     const conversation = result.conversations[0];
//     if (!conversation) {
//       throw new NotFoundException('Conversation not found');
//     }
    
//     return conversation;
//   }

//   /**
//    * Update a conversation (e.g., change title)
//    */
//   @Patch('conversations/:id')
//   async updateConversation(
//     @ActiveUser() user: ActiveUserData,
//     @Param('id') id: number,
//     @Body() updateConversationDto: any,
//   ): Promise<ConversationDto> {
//     // Combine ID parameter with the DTO
//     const dto = {
//       ...updateConversationDto,
//       conversationId: Number(id)
//     };
//     return this.messagingService.updateConversation(
//       user.sub,
//       dto
//     );
//   }

//   /**
//    * Add participants to a conversation
//    */
//   @Post('conversations/:id/participants')
//   async addParticipants(
//     @ActiveUser() user: ActiveUserData,
//     @Param('id') id: number,
//     @Body() addParticipantsDto: any,
//   ): Promise<ConversationDto> {
//     // Combine ID parameter with the DTO
//     const dto = {
//       ...addParticipantsDto,
//       conversationId: Number(id)
//     };
//     return this.messagingService.addParticipants(
//       user.sub,
//       dto
//     );
//   }

//   /**
//    * Remove a participant from a conversation
//    */
//   @Delete('conversations/:conversationId/participants/:userId')
//   async removeParticipant(
//     @ActiveUser() user: ActiveUserData,
//     @Param('conversationId') conversationId: number,
//     @Param('userId') participantId: number,
//   ): Promise<ConversationDto> {
//     const dto = {
//       conversationId: Number(conversationId),
//       userId: Number(participantId),
//     };
    
//     return this.messagingService.removeParticipant(user.sub, dto);
//   }

//   /**
//    * Send a text message to a conversation
//    */
//   @Post('messages')
//   async sendMessage(
//     @ActiveUser() user: ActiveUserData,
//     @Body() sendMessageDto: SendMessageDto,
//   ): Promise<MessageDto> {
//     return this.messagingService.sendMessage(user.sub, sendMessageDto);
//   }
  
//   /**
//    * Upload a file attachment to a conversation
//    */
//   @Post('messages/upload')
//   @UseInterceptors(FileInterceptor('file', { 
//     storage: diskStorage({
//       destination: './uploads/attachments',
//       filename: (req, file, callback) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//         const ext = extname(file.originalname);
//         callback(null, `${uniqueSuffix}${ext}`);
//       },
//     }),
//     limits: {
//       fileSize: 10 * 1024 * 1024, // 10MB limit
//     },
//   }))
//   async uploadFile(
//     @ActiveUser() user: ActiveUserData,
//     @UploadedFile() file: Express.Multer.File,
//     @Body('conversationId') conversationId: number,
//   ): Promise<MessageDto> {
//     // Create a message with the file as an attachment
//     const sendMessageDto: SendMessageDto = {
//       conversationId: Number(conversationId),
//       content: 'File attachment',
//       attachments: [{
//         fileName: file.originalname,
//         fileType: file.mimetype,
//         filePath: file.path,
//         fileSize: file.size
//       }]
//     };
    
//     return this.messagingService.sendMessage(user.sub, sendMessageDto);
//   }

//   /**
//    * Get all messages in a conversation
//    */
//   @Get('conversations/:id/messages')
//   async getMessages(
//     @ActiveUser() user: ActiveUserData, 
//     @Param('id') conversationId: string,
//   ): Promise<MessageListDto> {
//     // Create a messages DTO with the conversation ID from the URL
//     const getMessagesDto: GetMessagesDto = {
//       conversationId: parseInt(conversationId, 10),
//       limit: 20,
//       offset: 0
//     };
    
//     // Validate the conversation ID
//     if (isNaN(getMessagesDto.conversationId)) {
//       throw new BadRequestException('Conversation ID must be a valid number');
//     }
    
//     return this.messagingService.getMessages(user.sub, getMessagesDto);
//   }

//   /**
//    * Mark messages as read
//    */
//   @Post('messages/read')
//   @HttpCode(HttpStatus.OK)
//   async markMessagesRead(
//     @ActiveUser() user: ActiveUserData,
//     @Body() markMessagesReadDto: MarkMessagesReadDto,
//   ): Promise<{ success: boolean }> {
//     await this.messagingService.markMessagesAsRead(
//       user.sub,
//       markMessagesReadDto,
//     );
//     return { success: true };
//   }







//   /**
//    * Delete a message
//    */
//   @Delete('messages/:id')
//   async deleteMessage(
//     @ActiveUser() user: ActiveUserData,
//     @Param('id') id: number,
//     @Query('conversationId') conversationId: number,
//   ): Promise<void> {
//     const deleteDto: DeleteMessageDto = {
//       messageId: Number(id),
//       conversationId: Number(conversationId),
//     };
    
//     return this.messagingService.deleteMessage(
//       user.sub,
//       deleteDto
//     );
//   }
// }