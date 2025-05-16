import { Type } from 'class-transformer';
import {
  IsString,
  IsArray,
  IsInt,
  IsOptional,
  IsBoolean,
  ValidateNested,
  IsDateString,
  Min,
  Max,
  IsUrl,
  ArrayMinSize,
} from 'class-validator';

/**
 * DTO for creating a new conversation
 */
export class CreateConversationDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1)
  participantIds: number[];

  @IsBoolean()
  @IsOptional()
  isGroupChat?: boolean;
}

/**
 * DTO for sending a new message
 */
export class SendMessageDto {
  @IsInt()
  conversationId: number;

  @IsString()
  content: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MessageAttachmentDto)
  attachments?: MessageAttachmentDto[];

  @IsInt()
  @IsOptional()
  replyToId?: number;
}

export class MessageAttachmentDto {
  @IsUrl()
  url: string;

  @IsString()
  type: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  size?: number;
}

/**
 * DTO for participants in conversation responses
 */
export class ConversationParticipantDto {
  @IsInt()
  userId: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  profilePictureUrl?: string;
  
  @IsBoolean()
  isAdmin: boolean;

  @IsDateString()
  joinedAt: Date;

  @IsDateString()
  @IsOptional()
  lastReadAt?: Date;
}

/**
 * DTO for message responses
 */
export class MessageDto {
  @IsInt()
  messageId: number;

  @IsInt()
  senderId: number;
  
  @IsString()
  senderName: string;

  @IsString()
  @IsOptional()
  senderProfilePictureUrl?: string;

  @IsInt()
  conversationId: number;

  @IsString()
  content: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageAttachmentDto)
  attachments: MessageAttachmentDto[];

  @IsInt()
  @IsOptional()
  replyToId?: number;

  @IsArray()
  @IsInt({ each: true })
  readBy: number[];

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;
}

/**
 * DTO for conversation responses with participants
 */
export class ConversationDto {
  @IsInt()
  conversationId: number;

  @IsString()
  title: string;

  @IsBoolean()
  isGroupChat: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConversationParticipantDto)
  participants: ConversationParticipantDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => MessageDto)
  lastMessage?: MessageDto;

  @IsDateString()
  @IsOptional()
  lastMessageAt?: Date;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;
}

/**
 * DTO for message list responses
 */
export class MessageListDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: MessageDto[];

  @IsInt()
  total: number;

  @IsInt()
  offset: number;

  @IsInt()
  limit: number;
}

/**
 * DTO for conversation list responses
 */
export class ConversationListDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConversationDto)
  conversations: ConversationDto[];

  @IsInt()
  total: number;

  @IsInt()
  offset: number;

  @IsInt()
  limit: number;
}

/**
 * DTO for marking messages as read
 */
export class MarkMessagesReadDto {
  @IsInt()
  conversationId: number;

  @IsArray()
  @IsInt({ each: true })
  messageIds: number[];
}

/**
 * DTO for adding participants to a conversation
 */
export class AddParticipantsDto {
  @IsInt()
  conversationId: number;
  
  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1)
  userIds: number[];
}

/**
 * DTO for removing a participant from a conversation
 */
export class RemoveParticipantDto {
  @IsInt()
  conversationId: number;
  
  @IsInt()
  userId: number;
}

/**
 * DTO for modifying a conversation
 */
export class UpdateConversationDto {
  @IsInt()
  conversationId: number;
  
  @IsString()
  title: string;
}

/**
 * DTO for deleting a message
 */
export class DeleteMessageDto {
  @IsInt()
  messageId: number;
  
  @IsInt()
  conversationId: number;
}

/**
 * DTO for retrieving messages with filters
 */
export class GetMessagesDto {
  @IsInt()
  conversationId: number;
  
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number;

  @IsDateString()
  @IsOptional()
  before?: string;

  @IsDateString()
  @IsOptional()
  after?: string;

  @IsBoolean()
  @IsOptional()
  unreadOnly?: boolean;
} 