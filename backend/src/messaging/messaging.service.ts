// import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
// import {
//   ConversationDto,
//   CreateConversationDto,
//   SendMessageDto,
//   MessageDto,
//   MarkMessagesReadDto,
//   AddParticipantsDto,
//   UpdateConversationDto,
//   DeleteMessageDto,
//   GetMessagesDto,
//   MessageListDto,
//   ConversationListDto,
//   RemoveParticipantDto,
//   ConversationParticipantDto,
// } from './dto/messaging.dto';
// import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
// import { Inject } from '@nestjs/common';
// import { DATABASE_CONNECTION } from '../core/database-connection';
// import { eq, and, isNull, desc, inArray, count, sql } from 'drizzle-orm';
// import * as messagingSchema from './schemas/messaging.schema';

// // Internal interface definitions
// interface ConversationData {
//   conversation: typeof messagingSchema.conversations.$inferSelect;
//   participants: (typeof messagingSchema.conversationParticipants.$inferSelect & {
//     user?: typeof userSchema.users.$inferSelect;
//   })[];
//   lastMessage?: typeof messagingSchema.messages.$inferSelect;
//   unreadCount?: number;
// }

// @Injectable()
// export class MessagingService {
//   private readonly logger = new Logger(MessagingService.name);
  
//   constructor(
//     @Inject(DATABASE_CONNECTION) private db: PostgresJsDatabase,
//     // private jwtService: JwtService,
//   ) {}

//   // Create a new conversation
//   async createConversation(
//     userId: number,
//     createConversationDto: CreateConversationDto,
//   ): Promise<ConversationDto> {
//     // Enforce one-to-one communication only
//     if (createConversationDto.participantIds.length !== 1) {
//       throw new BadRequestException('Only one-to-one conversations are allowed');
//     }

//     // Ensure unique participants
//     const uniqueParticipantIds = Array.from(new Set([userId, ...createConversationDto.participantIds]));
    
//     if (uniqueParticipantIds.length !== 2) {
//       throw new BadRequestException('Conversation must be between exactly two users');
//     }
    
//     // Get all users
//     const userIds = [userId, ...createConversationDto.participantIds];
//     const users = await this.db.select()
//       .from(userSchema.users)
//       .where(inArray(userSchema.users.userId, userIds));
    
//     if (users.length !== userIds.length) {
//       // Find which user IDs are missing
//       const foundIds = users.map(u => u.userId);
//       const missingIds = userIds.filter(id => !foundIds.includes(id));
      
//       this.logger.error(`Missing user IDs: ${missingIds.join(', ')}`);
//       throw new BadRequestException(`One or more participants do not exist: Missing IDs: [${missingIds.join(', ')}]`);
//     }
    
//     // Now enforce one-to-one messaging rules based on user roles
//     const currentUser = users.find(u => u.userId === userId);
//     const targetUser = users.find(u => u.userId !== userId);
    
//     if (!currentUser || !targetUser) {
//       throw new BadRequestException('Cannot identify participants');
//     }

//     // Default to not allowing the conversation
//     let isValidConversation = false;

//     this.logger.log(`Validating conversation: ${currentUser.userType} to ${targetUser.userType}`);

//     // SIMPLIFIED ROLE-BASED CONVERSATION RULES:
//     // 1. Tutor to regular users 
//     // 2. Parent to Admin
//     // 3. Parent to their children
    
//     // Allow tutors to message regular users
//     if (currentUser.userType === 'tutor') {
//       this.logger.log('✅ Tutor can message users');
//       isValidConversation = true;
//     }
//     // When parent is trying to message an admin
//     else if (currentUser.userType === 'parent' && targetUser.userType === 'admin') {
//       this.logger.log('✅ Parent to Admin conversation allowed');
//       isValidConversation = true;
//     }
//     // When parent is messaging another user (possible child)
//     else if (currentUser.userType === 'parent') {
//       // Verify this is the parent record exists
//       const parentRecords = await this.db.select()
//         .from(parentSchema.parents)
//         .where(eq(parentSchema.parents.parentId, currentUser.userId));
        
//       if (parentRecords.length === 0) {
//         throw new BadRequestException('Parent record not found');
//       }

//       // Check if target is a child of this parent
//       const childrenRecords = await this.db.select()
//         .from(parentSchema.children)
//         .where(eq(parentSchema.children.parentId, currentUser.userId));
        
//       // Check if the target user ID matches any of the child IDs
//       isValidConversation = childrenRecords.some(child => child.childId === targetUser.userId);
      
//       if (isValidConversation) {
//         this.logger.log('✅ Parent to their Child conversation allowed');
//       } else {
//         this.logger.log('❌ Parent to someone else\'s Child conversation blocked');
//       }
//     }
//     // Check children table to see if this is an exchange between parent and child
//     else {
//       // Check if current user is in the children table
//       const childRecord = await this.db.select()
//         .from(parentSchema.children)
//         .where(eq(parentSchema.children.childId, currentUser.userId));
        
//       if (childRecord.length > 0) {
//         // Check if parentId is defined before comparing
//         isValidConversation = childRecord[0]?.parentId !== undefined && 
//                               childRecord[0].parentId === targetUser.userId;
        
//         if (isValidConversation) {
//           this.logger.log('✅ Child to their Parent conversation allowed');
//         } else {
//           this.logger.log('❌ Child to another Parent conversation blocked');
//         }
//       }
//     }
    
//     // When admin is starting a conversation - can message anyone
//     if (currentUser.userType === 'admin') {
//       this.logger.log('✅ Admin conversation allowed (can message anyone)');
//       isValidConversation = true;
//     }
    
//     if (!isValidConversation) {
//       this.logger.log(`❌ Conversation between ${currentUser.userType} and ${targetUser.userType} is not allowed`);
//     }

//     if (!isValidConversation) {
//       throw new BadRequestException(`Messages between ${currentUser.userType} and ${targetUser.userType} are not allowed`);
//     }

//     return await this.createOrGetDirectConversation(
//       uniqueParticipantIds,
//       users,
//       userId
//     );
//   }

//   // Helper method to create or get a direct conversation between two users
//   private async createOrGetDirectConversation(
//     uniqueParticipantIds: number[],
//     users: any[],
//     userId: number
//   ): Promise<ConversationDto> {
//     // Check if conversation already exists
//     const user1Id = uniqueParticipantIds[0];
//     const user2Id = uniqueParticipantIds[1];
    
//     if (user1Id !== undefined && user2Id !== undefined) {
//       const existingConversations = await this.getExistingDirectConversation(
//         user1Id,
//         user2Id,
//       );

//       if (existingConversations.length > 0 && existingConversations[0]) {
//         // Return the existing conversation
//         return this.mapConversationToDto(existingConversations[0]);
//       }
//     }

//     // Create a new conversation
//     const title = this.generateDefaultTitle(users, userId);
//     const isGroupChat = false; // Always false as we only allow one-to-one

//     const conversationResult = await this.db.transaction(async (tx) => {
//       // Insert the conversation
//       const newConversations = await tx.insert(messagingSchema.conversations)
//         .values({
//           title,
//           isGroupChat,
//           createdBy: userId,
//         })
//         .returning();
        
//       if (!newConversations || newConversations.length === 0) {
//         throw new BadRequestException('Failed to create conversation');
//       }
      
//       const newConversation = newConversations[0];
//       if (!newConversation) {
//         throw new BadRequestException('Failed to create conversation');
//       }

//       // Add all participants
//       const participantInserts = uniqueParticipantIds.map(participantId => ({
//         conversationId: newConversation.conversationId,
//         userId: participantId,
//         isAdmin: participantId === userId,
//       }));

//       const participants = await tx.insert(messagingSchema.conversationParticipants)
//         .values(participantInserts)
//         .returning();

//       return {
//         conversation: newConversation,
//         participants: participants.map(p => ({
//           ...p,
//           user: users.find(u => u.userId === p.userId),
//         })),
//       };
//     });

//     if (!conversationResult.conversation) {
//       throw new BadRequestException('Failed to create conversation');
//     }

//     return this.mapConversationToDto(conversationResult as ConversationData);
//   }

//   // Helper to generate default conversation title
//   public generateDefaultTitle(users: any[], currentUserId: number): string {
//     // Filter out the current user
//     const otherUsers = users.filter(user => user.userId !== currentUserId);
    
//     if (otherUsers.length === 0) {
//       return 'New Conversation';
//     } else if (otherUsers.length === 1) {
//       // Use firstName + lastName instead of name
//       return `${otherUsers[0].firstName} ${otherUsers[0].lastName}`;
//     } else {
//       // For group chats, use the first few names
//       const names = otherUsers.slice(0, 3).map(
//         user => `${user.firstName} ${user.lastName}`
//       );
//       return names.join(', ') + (otherUsers.length > 3 ? '...' : '');
//     }
//   }

//   // Helper to check for existing direct conversation between two users
//   public async getExistingDirectConversation(
//     userId1: number,
//     userId2: number,
//   ): Promise<ConversationData[]> {
//     // Find conversations where both users are participants
//     const user1Conversations = await this.db.select({
//       conversationId: messagingSchema.conversationParticipants.conversationId,
//     })
//       .from(messagingSchema.conversationParticipants)
//       .where(eq(messagingSchema.conversationParticipants.userId, userId1));
    
//     const user1ConversationIds = user1Conversations.map(c => c.conversationId);
    
//     if (user1ConversationIds.length === 0) {
//       return [];
//     }
    
//     const user2Conversations = await this.db.select({
//       conversationId: messagingSchema.conversationParticipants.conversationId,
//     })
//       .from(messagingSchema.conversationParticipants)
//       .where(and(
//         eq(messagingSchema.conversationParticipants.userId, userId2),
//         inArray(messagingSchema.conversationParticipants.conversationId, user1ConversationIds)
//       ));
    
//     const sharedConversationIds = user2Conversations.map(c => c.conversationId);
    
//     if (sharedConversationIds.length === 0) {
//       return [];
//     }
    
//     // Check if these are direct conversations (only 2 participants)
//     const participantCounts = await this.db.select({
//       conversationId: messagingSchema.conversationParticipants.conversationId,
//       count: count(),
//     })
//       .from(messagingSchema.conversationParticipants)
//       .where(inArray(messagingSchema.conversationParticipants.conversationId, sharedConversationIds))
//       .groupBy(messagingSchema.conversationParticipants.conversationId);
    
//     const directConversationIds = participantCounts
//       .filter(c => c.count === 2)
//       .map(c => c.conversationId);
    
//     if (directConversationIds.length === 0) {
//       return [];
//     }
    
//     // Get the conversations with their participants
//     return this.getConversationsWithParticipants(directConversationIds);
//   }
  

//   // Helper to get conversation with participants
//   public async getConversationsWithParticipants(
//     conversationIds: number[],
//   ): Promise<ConversationData[]> {
//     if (!conversationIds || conversationIds.length === 0) {
//       return [];
//     }
    
//     const conversations = await this.db.select()
//       .from(messagingSchema.conversations)
//       .where(inArray(messagingSchema.conversations.conversationId, conversationIds));
    
//     if (conversations.length === 0) {
//       return [];
//     }
    
//     const participants = await this.db.select({
//       participant: messagingSchema.conversationParticipants,
//       user: userSchema.users,
//     })
//       .from(messagingSchema.conversationParticipants)
//       .innerJoin(
//         userSchema.users,
//         eq(messagingSchema.conversationParticipants.userId, userSchema.users.userId)
//       )
//       .where(inArray(messagingSchema.conversationParticipants.conversationId, conversationIds));
    
//     const lastMessages = await this.db.select()
//       .from(messagingSchema.messages)
//       .where(and(
//         inArray(messagingSchema.messages.conversationId, conversationIds),
//         eq(messagingSchema.messages.isDeleted, false),
//       ))
//       .orderBy(desc(messagingSchema.messages.sentAt))
//       .limit(conversationIds.length);
    
//     const result: ConversationData[] = [];
    
//     for (const conversation of conversations) {
//       const conversationParticipants = participants
//         .filter(p => p.participant.conversationId === conversation.conversationId)
//         .map(p => ({
//           ...p.participant,
//           user: p.user,
//         }));
      
//       const lastMessage = lastMessages.find(
//         m => m.conversationId === conversation.conversationId
//       );
      
//       result.push({
//         conversation,
//         participants: conversationParticipants,
//         lastMessage: lastMessage as typeof messagingSchema.messages.$inferSelect | undefined,
//       });
//     }
    
//     return result;
//   }

//   // Helper to map conversation data to DTO
//   public mapConversationToDto(data: ConversationData): ConversationDto {
//     const participants: ConversationParticipantDto[] = data.participants.map(participant => ({
//       userId: participant.userId,
//       name: participant.user 
//         ? `${participant.user.firstName} ${participant.user.lastName}`
//         : 'Unknown User',
//       profilePictureUrl: participant.user?.photo || null,
//       isAdmin: participant.isAdmin ?? false,
//       joinedAt: participant.joinedAt,
//       lastReadAt: participant.lastReadAt || undefined,
//     }));
    
//     let lastMessage: MessageDto | undefined = undefined;
    
//     if (data.lastMessage) {
//       const sender = data.participants.find(p => p.userId === data.lastMessage?.senderId);
      
//       const senderName = sender?.user 
//         ? `${sender.user.firstName} ${sender.user.lastName}`
//         : 'Unknown User';
      
//       lastMessage = {
//         messageId: data.lastMessage.messageId,
//         senderId: data.lastMessage.senderId,
//         senderName,
//         senderProfilePictureUrl: sender?.user?.photo ?? null,
//         conversationId: data.lastMessage.conversationId,
//         content: data.lastMessage.content ?? '',
//         attachments: data.lastMessage.attachments ? JSON.parse(data.lastMessage.attachments as string) : [],
//         replyToId: data.lastMessage.replyToId === null ? undefined : data.lastMessage.replyToId,
//         readBy: [],  // Read receipts not loaded here for performance
//         createdAt: data.lastMessage.sentAt,
//         updatedAt: data.lastMessage.sentAt,
//       };
//     }
    
//     return {
//       conversationId: data.conversation.conversationId,
//       title: data.conversation.title ?? '',  // Convert null to empty string
//       isGroupChat: data.conversation.isGroupChat ?? false,  // Convert null to false
//       participants,
//       lastMessage,
//       lastMessageAt: data.conversation.lastMessageAt,
//       createdAt: data.conversation.createdAt,
//       updatedAt: data.conversation.updatedAt,
//     };
//   }

//   // Send a message
//   async sendMessage(userId: number, sendMessageDto: SendMessageDto): Promise<MessageDto> {
//     // Check if conversation exists and user is a participant
//     const participant = await this.db.select()
//       .from(messagingSchema.conversationParticipants)
//       .where(and(
//         eq(messagingSchema.conversationParticipants.conversationId, sendMessageDto.conversationId),
//         eq(messagingSchema.conversationParticipants.userId, userId),
//         isNull(messagingSchema.conversationParticipants.leftAt)
//       ))
//       .limit(1);
    
//     if (participant.length === 0) {
//       throw new ForbiddenException('You are not a participant in this conversation');
//     }
    
//     // If replying to a message, verify it exists in the same conversation
//     if (sendMessageDto.replyToId) {
//       const replyToMessage = await this.db.select()
//         .from(messagingSchema.messages)
//         .where(and(
//           eq(messagingSchema.messages.messageId, sendMessageDto.replyToId),
//           eq(messagingSchema.messages.conversationId, sendMessageDto.conversationId)
//         ))
//         .limit(1);
      
//       if (replyToMessage.length === 0) {
//         throw new BadRequestException('Reply-to message not found in this conversation');
//       }
//     }
    
//     // Insert the message
//     const result = await this.db.transaction(async (tx) => {
//       // Insert message
//       const [message] = await tx.insert(messagingSchema.messages)
//         .values({
//           conversationId: sendMessageDto.conversationId,
//           senderId: userId,
//           content: sendMessageDto.content,
//           attachments: sendMessageDto.attachments ? JSON.stringify(sendMessageDto.attachments) : null,
//           replyToId: sendMessageDto.replyToId || null,
//         })
//         .returning();
      
//       if (!message) {
//         throw new BadRequestException('Failed to insert message');
//       }
      
//       // Update the conversation's last message timestamp
//       await tx.update(messagingSchema.conversations)
//         .set({
//           lastMessageAt: message.sentAt,
//           updatedAt: message.sentAt,
//         })
//         .where(eq(messagingSchema.conversations.conversationId, sendMessageDto.conversationId));
      
//       // Add read receipt for sender
//       await tx.insert(messagingSchema.messageReadReceipts)
//         .values({
//           messageId: message.messageId,
//           userId: userId,
//         });
      
//       return message;
//     });
    
//     // Get sender info for the response
//     const senders = await this.db.select()
//       .from(userSchema.users)
//       .where(eq(userSchema.users.userId, userId))
//       .limit(1);
    
//     const sender = senders[0];
    
//     if (!sender) {
//       throw new BadRequestException('Sender information not found');
//     }
    
//     // Create the full name from firstName and lastName
//     const senderName = `${sender.firstName} ${sender.lastName}`;
//     // Use photo field for profile picture
//     const senderProfilePictureUrl = sender.photo || null;
    
//     // Transform to DTO
//     return {
//       messageId: result.messageId,
//       senderId: userId,
//       senderName,
//       senderProfilePictureUrl,
//       conversationId: sendMessageDto.conversationId,
//       content: result.content || '',
//       attachments: result.attachments ? JSON.parse(result.attachments as string) : [],
//       replyToId: result.replyToId,
//       readBy: [userId],
//       createdAt: result.sentAt,
//       updatedAt: result.sentAt,
//     };
//   }

//   // Mark messages as read
//   async markMessagesAsRead(userId: number, dto: MarkMessagesReadDto): Promise<void> {
//     // Check if user is a participant in the conversation
//     const participant = await this.db.select()
//       .from(messagingSchema.conversationParticipants)
//       .where(and(
//         eq(messagingSchema.conversationParticipants.conversationId, dto.conversationId),
//         eq(messagingSchema.conversationParticipants.userId, userId)
//       ))
//       .limit(1);
    
//     if (participant.length === 0) {
//       throw new ForbiddenException('You are not a participant in this conversation');
//     }
    
//     // Check if messages exist and belong to the specified conversation
//     const messages = await this.db.select()
//       .from(messagingSchema.messages)
//       .where(and(
//         inArray(messagingSchema.messages.messageId, dto.messageIds),
//         eq(messagingSchema.messages.conversationId, dto.conversationId)
//       ));
    
//     if (messages.length !== dto.messageIds.length) {
//       throw new BadRequestException('One or more messages not found in this conversation');
//     }
    
//     // Get existing read receipts
//     const existingReceipts = await this.db.select()
//       .from(messagingSchema.messageReadReceipts)
//       .where(and(
//         inArray(messagingSchema.messageReadReceipts.messageId, dto.messageIds),
//         eq(messagingSchema.messageReadReceipts.userId, userId)
//       ));
    
//     // Calculate which messages need new read receipts
//     const existingReceiptMessageIds = existingReceipts.map(r => r.messageId);
//     const messageIdsToMark = dto.messageIds.filter(
//       id => !existingReceiptMessageIds.includes(id)
//     );
    
//     if (messageIdsToMark.length > 0) {
//       // Insert read receipts
//       const readReceipts = messageIdsToMark.map(messageId => ({
//         messageId,
//         userId,
//       }));
      
//       await this.db.insert(messagingSchema.messageReadReceipts)
//         .values(readReceipts);
      
//       // Update participant's lastReadAt timestamp
//       await this.db.update(messagingSchema.conversationParticipants)
//         .set({ lastReadAt: new Date() })
//         .where(and(
//           eq(messagingSchema.conversationParticipants.conversationId, dto.conversationId),
//           eq(messagingSchema.conversationParticipants.userId, userId)
//         ));
//     }
//   }

//   // Get user's conversations
//   async getConversations(
//     userId: number,
//     offset: number = 0,
//     limit: number = 20,
//     specificConversationIds?: number[],  // Optional parameter to get specific conversations
//   ): Promise<ConversationListDto> {
//     // Get conversation IDs where user is a participant
//     let conversationIds: number[] = [];
    
//     if (specificConversationIds && specificConversationIds.length > 0) {
//       // If specific IDs provided, use those, but verify user is a participant
//       const participations = await this.db.select({
//         conversationId: messagingSchema.conversationParticipants.conversationId,
//       })
//         .from(messagingSchema.conversationParticipants)
//         .where(and(
//           eq(messagingSchema.conversationParticipants.userId, userId),
//           isNull(messagingSchema.conversationParticipants.leftAt),
//           inArray(messagingSchema.conversationParticipants.conversationId, specificConversationIds)
//         ));
      
//       conversationIds = participations.map(p => p.conversationId);
//     } else {
//       // Get all conversation IDs for this user
//       const participations = await this.db.select({
//         conversationId: messagingSchema.conversationParticipants.conversationId,
//       })
//         .from(messagingSchema.conversationParticipants)
//         .where(and(
//           eq(messagingSchema.conversationParticipants.userId, userId),
//           isNull(messagingSchema.conversationParticipants.leftAt)
//         ));
      
//       conversationIds = participations.map(p => p.conversationId);
//     }
    
//     if (conversationIds.length === 0) {
//       return {
//         conversations: [],
//         total: 0,
//         offset,
//         limit,
//       };
//     }
    
//     // Get total count
//     const countResult = await this.db.select({
//       count: count(),
//     })
//       .from(messagingSchema.conversations)
//       .where(inArray(messagingSchema.conversations.conversationId, conversationIds));
    
//     const total = countResult.length > 0 && countResult[0] ? Number(countResult[0].count) : 0;
    
//     // Get conversations with participants and last message
//     const conversationsData = await this.getConversationsWithParticipants(conversationIds);
    
//     if (conversationsData.length === 0) {
//       return {
//         conversations: [],
//         total: 0,
//         offset,
//         limit,
//       };
//     }
    
//     // Sort by last message time and apply pagination
//     const sorted = conversationsData.sort((a, b) => {
//       const aTime = a.conversation.lastMessageAt.getTime();
//       const bTime = b.conversation.lastMessageAt.getTime();
//       return bTime - aTime; // descending
//     });
    
//     // If we're looking for specific conversations, don't apply pagination
//     const paged = specificConversationIds 
//       ? sorted 
//       : sorted.slice(offset, offset + limit);
    
//     // Get unread count for each conversation
//     const conversationDtosPromises = paged.map(async (data) => {
//       const unreadCount = await this.getUnreadCount(userId, data.conversation.conversationId);
//       data.unreadCount = unreadCount;
//       return this.mapConversationToDto(data);
//     });
    
//     const conversationDtos = await Promise.all(conversationDtosPromises);
    
//     return {
//       conversations: conversationDtos,
//       total,
//       offset,
//       limit,
//     };
//   }

//   // Helper to get unread count for a conversation
//   public async getUnreadCount(userId: number, conversationId: number): Promise<number> {
//     const participants = await this.db.select({
//       lastReadAt: messagingSchema.conversationParticipants.lastReadAt,
//     })
//       .from(messagingSchema.conversationParticipants)
//       .where(and(
//         eq(messagingSchema.conversationParticipants.conversationId, conversationId),
//         eq(messagingSchema.conversationParticipants.userId, userId)
//       ))
//       .limit(1);
    
//     const participant = participants.length > 0 ? participants[0] : null;
    
//     if (!participant || !participant.lastReadAt) {
//       // If no lastReadAt timestamp or not a participant, count all messages
//       const countResults = await this.db.select({
//         count: count(),
//       })
//         .from(messagingSchema.messages)
//         .where(and(
//           eq(messagingSchema.messages.conversationId, conversationId),
//           eq(messagingSchema.messages.isDeleted, false)
//         ));
      
//       return countResults.length > 0 && countResults[0] ? Number(countResults[0].count) : 0;
//     }
    
//     // Count messages newer than lastReadAt
//     const countResults = await this.db.select({
//       count: count(),
//     })
//       .from(messagingSchema.messages)
//       .where(and(
//         eq(messagingSchema.messages.conversationId, conversationId),
//         eq(messagingSchema.messages.isDeleted, false),
//         sql`${messagingSchema.messages.sentAt} > ${participant.lastReadAt}`
//       ));
    
//     return countResults.length > 0 && countResults[0] ? Number(countResults[0].count) : 0;
//   }

//   // Get messages in a conversation
//   async getMessages(
//     userId: number,
//     dto: GetMessagesDto,
//   ): Promise<MessageListDto> {
//     // Check if user is a participant in the conversation
//     const participant = await this.db.select()
//       .from(messagingSchema.conversationParticipants)
//       .where(and(
//         eq(messagingSchema.conversationParticipants.conversationId, dto.conversationId),
//         eq(messagingSchema.conversationParticipants.userId, userId)
//       ))
//       .limit(1);
    
//     if (participant.length === 0) {
//       throw new ForbiddenException('You are not a participant in this conversation');
//     }
    
//     // Build query conditions
//     const conditions = [
//       eq(messagingSchema.messages.conversationId, dto.conversationId),
//       eq(messagingSchema.messages.isDeleted, false),
//     ];
    
//     if (dto.before) {
//       conditions.push(sql`${messagingSchema.messages.sentAt} < ${new Date(dto.before)}`);
//     }
    
//     if (dto.after) {
//       conditions.push(sql`${messagingSchema.messages.sentAt} > ${new Date(dto.after)}`);
//     }
    
//     // If unreadOnly is true, fetch only unread messages
//     if (dto.unreadOnly && participant.length > 0 && participant[0] && participant[0].lastReadAt) {
//       conditions.push(sql`${messagingSchema.messages.sentAt} > ${participant[0].lastReadAt}`);
//     }
    
//     // Get total count
//     const countResult = await this.db.select({
//       count: count(),
//     })
//       .from(messagingSchema.messages)
//       .where(and(...conditions));
    
//     const total = countResult.length > 0 && countResult[0] ? Number(countResult[0].count) : 0;
    
//     // Get messages
//     const limit = dto.limit || 50;
//     const offset = dto.offset || 0;
    
//     const messages = await this.db.select()
//       .from(messagingSchema.messages)
//       .where(and(...conditions))
//       .orderBy(desc(messagingSchema.messages.sentAt))
//       .limit(limit)
//       .offset(offset);
    
//     // Get sender information
//     const senderIds = [...new Set(messages.map(m => m.senderId))];
//     const senders = await this.db.select()
//       .from(userSchema.users)
//       .where(inArray(userSchema.users.userId, senderIds));
    
//     // Get read receipts
//     const messageIds = messages.map(m => m.messageId);
//     const readReceipts = await this.db.select()
//       .from(messagingSchema.messageReadReceipts)
//       .where(inArray(messagingSchema.messageReadReceipts.messageId, messageIds));
    
//     // Map to DTOs
//     const messageDtos = messages.map(message => {
//       const sender = senders.find(s => s.userId === message.senderId);
//       const messageReaders = readReceipts
//         .filter(r => r.messageId === message.messageId)
//         .map(r => r.userId);
      
//       // Create sender name and profile picture from user fields
//       const senderName = sender 
//         ? `${sender.firstName} ${sender.lastName}` 
//         : 'Unknown User';
      
//       const senderProfilePictureUrl = sender?.photo || null;
      
//       return {
//         messageId: message.messageId,
//         senderId: message.senderId,
//         senderName,
//         senderProfilePictureUrl,
//         conversationId: message.conversationId,
//         content: message.content || '',
//         attachments: message.attachments ? JSON.parse(message.attachments as string) : [],
//         replyToId: message.replyToId,
//         readBy: messageReaders,
//         createdAt: message.sentAt,
//         updatedAt: message.sentAt,
//       };
//     });
    
//     return {
//       messages: messageDtos,
//       total,
//       offset,
//       limit,
//     };
//   }

//   // Delete a message
//   async deleteMessage(userId: number, dto: DeleteMessageDto): Promise<void> {
//     // Check if message exists and user is the sender
//     const messages = await this.db.select()
//       .from(messagingSchema.messages)
//       .where(and(
//         eq(messagingSchema.messages.messageId, dto.messageId),
//         eq(messagingSchema.messages.conversationId, dto.conversationId)
//       ))
//       .limit(1);
    
//     if (messages.length === 0) {
//       throw new NotFoundException('Message not found');
//     }
    
//     const message = messages[0];
    
//     if (message && message.senderId !== userId) {
//       throw new ForbiddenException('You can only delete your own messages');
//     }
    
//     // Soft delete the message
//     await this.db.update(messagingSchema.messages)
//       .set({ isDeleted: true })
//       .where(eq(messagingSchema.messages.messageId, dto.messageId));
//   }

//   // Update conversation (change title)
//   async updateConversation(
//     userId: number,
//     dto: UpdateConversationDto,
//   ): Promise<ConversationDto> {
//     // Check if conversation exists and user is a participant with admin rights
//     const participant = await this.db.select()
//       .from(messagingSchema.conversationParticipants)
//       .where(and(
//         eq(messagingSchema.conversationParticipants.conversationId, dto.conversationId),
//         eq(messagingSchema.conversationParticipants.userId, userId),
//         eq(messagingSchema.conversationParticipants.isAdmin, true)
//       ))
//       .limit(1);
    
//     if (participant.length === 0) {
//       throw new ForbiddenException('You do not have permission to update this conversation');
//     }
    
//     // Update the conversation
//     await this.db.update(messagingSchema.conversations)
//       .set({
//         title: dto.title,
//         updatedAt: new Date(),
//       })
//       .where(eq(messagingSchema.conversations.conversationId, dto.conversationId));
    
//     // Get updated conversation with participants
//     const conversationsData = await this.getConversationsWithParticipants([dto.conversationId]);
//     const conversationData = conversationsData.length > 0 ? conversationsData[0] : null;
    
//     if (!conversationData) {
//       throw new NotFoundException('Conversation not found after update');
//     }
    
//     // Get unread count
//     const unreadCount = await this.getUnreadCount(userId, dto.conversationId);
//     conversationData.unreadCount = unreadCount;
    
//     return this.mapConversationToDto(conversationData);
//   }

//   // Add participants to a conversation
//   async addParticipants(
//     userId: number,
//     dto: AddParticipantsDto,
//   ): Promise<ConversationDto> {
//     // Check if conversation exists and user is an admin
//     const participant = await this.db.select()
//       .from(messagingSchema.conversationParticipants)
//       .where(and(
//         eq(messagingSchema.conversationParticipants.conversationId, dto.conversationId),
//         eq(messagingSchema.conversationParticipants.userId, userId),
//         eq(messagingSchema.conversationParticipants.isAdmin, true)
//       ))
//       .limit(1);
    
//     if (participant.length === 0) {
//       throw new ForbiddenException('You do not have permission to add participants');
//     }
    
//     // Get existing participants to avoid duplicates
//     const existingParticipants = await this.db.select({
//       userId: messagingSchema.conversationParticipants.userId,
//     })
//       .from(messagingSchema.conversationParticipants)
//       .where(eq(messagingSchema.conversationParticipants.conversationId, dto.conversationId));
    
//     const existingUserIds = existingParticipants.map(p => p.userId);
    
//     // Filter out users who are already participants
//     const newUserIds = dto.userIds.filter(id => !existingUserIds.includes(id));
    
//     if (newUserIds.length > 0) {
//       // Make sure all new users exist
//       const users = await this.db.select()
//         .from(userSchema.users)
//         .where(inArray(userSchema.users.userId, newUserIds));
      
//       if (users.length !== newUserIds.length) {
//         throw new BadRequestException('One or more users do not exist');
//       }
      
//       // Add new participants
//       await this.db.transaction(async (tx) => {
//         const participantInserts = newUserIds.map(newUserId => ({
//           conversationId: dto.conversationId,
//           userId: newUserId,
//           isAdmin: false,
//         }));
        
//         await tx.insert(messagingSchema.conversationParticipants)
//           .values(participantInserts);
        
//         // If it's a direct chat, convert it to a group chat
//         const conversation = await tx.select()
//           .from(messagingSchema.conversations)
//           .where(eq(messagingSchema.conversations.conversationId, dto.conversationId))
//           .limit(1);
        
//         if (conversation.length > 0 && conversation[0] && !conversation[0].isGroupChat) {
//           await tx.update(messagingSchema.conversations)
//             .set({
//               isGroupChat: true,
//               updatedAt: new Date(),
//             })
//             .where(eq(messagingSchema.conversations.conversationId, dto.conversationId));
//         }
//       });
//     }
    
//     // Get updated conversation with participants
//     const conversationsData = await this.getConversationsWithParticipants([dto.conversationId]);
//     const conversationData = conversationsData.length > 0 ? conversationsData[0] : null;
    
//     if (!conversationData) {
//       throw new NotFoundException('Conversation not found after adding participants');
//     }
    
//     // Get unread count
//     const unreadCount = await this.getUnreadCount(userId, dto.conversationId);
//     conversationData.unreadCount = unreadCount;
    
//     return this.mapConversationToDto(conversationData);
//   }

//   // Remove participant from a conversation
//   async removeParticipant(
//     userId: number,
//     dto: RemoveParticipantDto,
//   ): Promise<ConversationDto> {
//     // Allow users to remove themselves, or admins to remove others
//     const isAdmin = userId !== dto.userId;
    
//     // If removing someone else, check admin status
//     if (isAdmin) {
//       const adminCheck = await this.db.select()
//         .from(messagingSchema.conversationParticipants)
//         .where(and(
//           eq(messagingSchema.conversationParticipants.conversationId, dto.conversationId),
//           eq(messagingSchema.conversationParticipants.userId, userId),
//           eq(messagingSchema.conversationParticipants.isAdmin, true)
//         ))
//         .limit(1);
      
//       if (adminCheck.length === 0) {
//         throw new ForbiddenException('You do not have permission to remove participants');
//       }
//     }
    
//     // Check if target participant exists
//     const participant = await this.db.select()
//       .from(messagingSchema.conversationParticipants)
//       .where(and(
//         eq(messagingSchema.conversationParticipants.conversationId, dto.conversationId),
//         eq(messagingSchema.conversationParticipants.userId, dto.userId)
//       ))
//       .limit(1);
    
//     if (participant.length === 0) {
//       throw new NotFoundException('Participant not found');
//     }
    
//     // Soft delete by setting leftAt
//     await this.db.update(messagingSchema.conversationParticipants)
//       .set({ leftAt: new Date() })
//       .where(and(
//         eq(messagingSchema.conversationParticipants.conversationId, dto.conversationId),
//         eq(messagingSchema.conversationParticipants.userId, dto.userId)
//       ));
    
//     // If user is removing themselves, return empty conversation
//     if (userId === dto.userId) {
//       return {
//         conversationId: dto.conversationId,
//         title: '',
//         isGroupChat: false,
//         participants: [],
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };
//     }
    
//     // Get updated conversation with participants
//     const conversationsData = await this.getConversationsWithParticipants([dto.conversationId]);
//     const conversationData = conversationsData.length > 0 ? conversationsData[0] : null;
    
//     if (!conversationData) {
//       throw new NotFoundException('Conversation not found after removing participant');
//     }
    
//     // Get unread count
//     const unreadCount = await this.getUnreadCount(userId, dto.conversationId);
//     conversationData.unreadCount = unreadCount;
    
//     return this.mapConversationToDto(conversationData);
//   }

//   // Get a single conversation by ID
//   async getConversation(userId: number, conversationId: number): Promise<ConversationDto | null> {
//     // Check if user is a participant in this conversation
//     const participant = await this.db.select()
//       .from(messagingSchema.conversationParticipants)
//       .where(and(
//         eq(messagingSchema.conversationParticipants.conversationId, conversationId),
//         eq(messagingSchema.conversationParticipants.userId, userId)
//       ))
//       .limit(1);
    
//     if (participant.length === 0) {
//       return null;
//     }
    
//     // Get conversation with participants
//     const conversationsData = await this.getConversationsWithParticipants([conversationId]);
    
//     if (conversationsData.length === 0) {
//       return null;
//     }
    
//     // Get unread count
//     const unreadCount = await this.getUnreadCount(userId, conversationId);
    
//     if (conversationsData.length > 0 && conversationsData[0]) {
//       conversationsData[0].unreadCount = unreadCount;
//       return this.mapConversationToDto(conversationsData[0]);
//     }
    
//     return null;
//   }
// } 