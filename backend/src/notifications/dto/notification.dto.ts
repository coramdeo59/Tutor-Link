import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum, IsBoolean, IsUrl, IsDateString } from 'class-validator';
import { NotificationType } from '../schema/notification.schema';

/**
 * DTO for creating a new notification
 */
export class CreateNotificationDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: string;

  @IsOptional()
  @IsUrl()
  actionUrl?: string;

  @IsOptional()
  @IsInt()
  relatedEntityId?: number;

  @IsOptional()
  @IsString()
  relatedEntityType?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

/**
 * DTO for notification responses
 */
export class NotificationResponseDto {
  notificationId: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  actionUrl?: string;
  relatedEntityId?: number;
  relatedEntityType?: string;
  createdAt: Date;
  expiresAt?: Date;
}

/**
 * DTO for marking notifications as read
 */
export class MarkNotificationsReadDto {
  @IsOptional()
  @IsInt({ each: true })
  notificationIds?: number[];

  @IsOptional()
  @IsBoolean()
  markAll?: boolean;
}

/**
 * DTO for notification filters
 */
export class NotificationFilterDto {
  @IsOptional()
  @IsBoolean()
  unreadOnly?: boolean;

  @IsOptional()
  @IsEnum(NotificationType, { each: true })
  types?: string[];

  @IsOptional()
  @IsInt()
  limit?: number;

  @IsOptional()
  @IsInt()
  offset?: number;
}

/**
 * DTO for bulk notification creation (for system-wide notifications)
 */
export class BulkNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: string;

  @IsOptional()
  @IsUrl()
  actionUrl?: string;

  @IsOptional()
  @IsInt({ each: true })
  userIds?: number[];

  @IsOptional()
  @IsEnum(['admin', 'parent', 'child', 'tutor'], { each: true })
  roles?: string[];

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
} 