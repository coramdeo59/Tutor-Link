// import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { Socket } from 'socket.io';
// import {
//   ConversationDto,
//   ConversationParticipantDto,
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
// } from './dto/messaging.dto';
// import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
// import { Inject } from '@nestjs/common';
// import { DATABASE_CONNECTION } from '../core/database-connection';
// import { eq, and, or, isNull, desc, asc, inArray, count, sql } from 'drizzle-orm';
// import * as userSchema from '../users/schema/User-schema';
// import * as messagingSchema from './schema/messaging.schema';

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

// } 