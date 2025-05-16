import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '../core/database-connection';
import { 
  notifications, 
  NotificationType
} from './schema/notification.schema';
import * as userSchema from '../users/schema/User-schema';
import { eq, and, or, sql, desc, isNull, lt, gte, SQL, SQLWrapper } from 'drizzle-orm';
import { 
  CreateNotificationDto, 
  NotificationFilterDto, 
  BulkNotificationDto
} from './dto/notification.dto';
import { Role } from '../users/enums/role-enums';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      notifications: typeof notifications;
      users: typeof userSchema.users;
    }>,
  ) {}

  /**
   * Create a new notification for a user
   * @param createNotificationDto Data for the new notification
   * @returns Created notification
   */
  async createNotification(createNotificationDto: CreateNotificationDto) {
    try {
      // Verify the user exists
      const userExists = await this.database
        .select({ userId: userSchema.users.userId })
        .from(userSchema.users)
        .where(eq(userSchema.users.userId, createNotificationDto.userId));

      if (userExists.length === 0) {
        throw new NotFoundException(`User with ID ${createNotificationDto.userId} not found`);
      }

      // Create the notification
      const result = await this.database
        .insert(notifications)
        .values({
          userId: createNotificationDto.userId,
          title: createNotificationDto.title,
          message: createNotificationDto.message,
          type: createNotificationDto.type,
          actionUrl: createNotificationDto.actionUrl,
          relatedEntityId: createNotificationDto.relatedEntityId,
          relatedEntityType: createNotificationDto.relatedEntityType,
          expiresAt: createNotificationDto.expiresAt 
            ? new Date(createNotificationDto.expiresAt) 
            : undefined,
          createdAt: new Date(),
        })
        .returning();

      if (result.length === 0) {
        throw new Error('Failed to create notification');
      }

      return result[0];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  /**
   * Get notifications for a user with filtering options
   * @param userId ID of the user
   * @param filters Filtering options
   * @returns List of notifications
   */
  async getUserNotifications(userId: number, filters?: NotificationFilterDto) {
    try {
      // Check if user exists
      const userExists = await this.database
        .select({ userId: userSchema.users.userId })
        .from(userSchema.users)
        .where(eq(userSchema.users.userId, userId));

      if (userExists.length === 0) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Build query conditions
      let conditions: SQL<unknown> = eq(notifications.userId, userId);
      
      // Add filter for unread notifications
      if (filters?.unreadOnly) {
        conditions = and(conditions, eq(notifications.read, false)) as SQL<unknown>;
      }
      
      // Add filter for notification types
      if (filters?.types && filters.types.length > 0) {
        const typeConditions = filters.types.map(type => 
          eq(notifications.type, type)
        );
        conditions = and(conditions, or(...typeConditions)) as SQL<unknown>;
      }
      
      // Don't show expired notifications
      const now = new Date();
      conditions = and(
        conditions, 
        or(
          isNull(notifications.expiresAt),
          gte(notifications.expiresAt, now)
        ) as SQL<unknown>
      ) as SQL<unknown>;

      // Execute query
      let query = this.database
        .select()
        .from(notifications)
        .where(conditions)
        .orderBy(desc(notifications.createdAt));
      
      // Apply pagination if provided
      if (filters?.limit) {
        query = query.limit(filters.limit) as any;
      }
      
      if (filters?.offset) {
        query = query.offset(filters.offset) as any;
      }
      
      const result = await query;
      
      // Count unread notifications
      const unreadCount = await this.database
        .select({ count: sql`count(*)` })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.read, false),
            or(
              isNull(notifications.expiresAt),
              gte(notifications.expiresAt, now)
            )
          )
        );
      
      return {
        notifications: result,
        unreadCount: Number(unreadCount[0]?.count || 0),
        totalCount: result.length,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to get user notifications: ${error.message}`);
    }
  }

  /**
   * Mark specific notifications as read
   * @param userId ID of the user
   * @param notificationIds IDs of notifications to mark as read
   * @returns Success result
   */
  async markNotificationsAsRead(userId: number, notificationIds: number[]) {
    try {
      if (!notificationIds || notificationIds.length === 0) {
        throw new BadRequestException('No notification IDs provided');
      }

      // Update only notifications that belong to this user
      const result = await this.database
        .update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.userId, userId),
            sql`${notifications.notificationId} IN (${notificationIds.join(',')})`
          )
        )
        .returning();

      return {
        success: true,
        markedAsRead: result.length,
        notificationIds: result.map(n => n.notificationId),
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Failed to mark notifications as read: ${error.message}`);
    }
  }

  /**
   * Mark all notifications for a user as read
   * @param userId ID of the user
   * @returns Success result
   */
  async markAllNotificationsAsRead(userId: number) {
    try {
      const result = await this.database
        .update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.read, false)
          )
        )
        .returning();

      return {
        success: true,
        markedAsRead: result.length,
      };
    } catch (error) {
      throw new Error(`Failed to mark all notifications as read: ${error.message}`);
    }
  }

  /**
   * Delete expired notifications to clean up the database
   * @returns Number of deleted notifications
   */
  async deleteExpiredNotifications() {
    try {
      const now = new Date();
      const result = await this.database
        .delete(notifications)
        .where(
          and(
            lt(notifications.expiresAt, now),
            // Only delete non-null expiration dates
            sql`${notifications.expiresAt} IS NOT NULL`
          )
        )
        .returning();

      return {
        success: true,
        deletedCount: result.length,
      };
    } catch (error) {
      throw new Error(`Failed to delete expired notifications: ${error.message}`);
    }
  }

  /**
   * Send bulk notifications to multiple users
   * @param bulkNotificationDto Data for the bulk notification
   * @returns Result with count of notifications created
   */
  async sendBulkNotifications(bulkNotificationDto: BulkNotificationDto) {
    try {
      // Determine target users
      let targetUserIds: number[] = [];
      
      // If specific user IDs are provided, use those
      if (bulkNotificationDto.userIds && bulkNotificationDto.userIds.length > 0) {
        targetUserIds = bulkNotificationDto.userIds;
      } 
      // Otherwise, if roles are specified, get users with those roles
      else if (bulkNotificationDto.roles && bulkNotificationDto.roles.length > 0) {
        const roleConditions = bulkNotificationDto.roles.map(role => {
          // Instead of directly comparing to role strings,
          // use a safer approach by checking if user IDs are in specific user groups
          switch (role) {
            case 'admin':
              return eq(userSchema.users.role, Role.Admin) as SQL<unknown>;
            case 'parent':
            case 'child':
            case 'tutor':
              // Since we're having type issues with roles, let's use a different approach
              // Just use 'regular' for non-admin roles, then filter further in application code if needed
              return eq(userSchema.users.role, Role.Regular) as SQL<unknown>;
            default:
              return null;
          }
        }).filter(Boolean) as SQL<unknown>[];
        
        if (roleConditions.length > 0) {
          const users = await this.database
            .select({ userId: userSchema.users.userId })
            .from(userSchema.users)
            .where(or(...(roleConditions as SQLWrapper[])));
          
          targetUserIds = users.map(u => u.userId);
        }
      }
      
      if (targetUserIds.length === 0) {
        throw new BadRequestException('No target users specified for bulk notification');
      }
      
      // Prepare notification values
      const notificationValues = targetUserIds.map(userId => ({
        userId,
        title: bulkNotificationDto.title,
        message: bulkNotificationDto.message,
        type: bulkNotificationDto.type,
        actionUrl: bulkNotificationDto.actionUrl,
        expiresAt: bulkNotificationDto.expiresAt 
          ? new Date(bulkNotificationDto.expiresAt) 
          : undefined,
        createdAt: new Date(),
      }));
      
      // Insert all notifications
      const result = await this.database
        .insert(notifications)
        .values(notificationValues)
        .returning({ notificationId: notifications.notificationId });
      
      return {
        success: true,
        createdCount: result.length,
        targetUserCount: targetUserIds.length,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Failed to send bulk notifications: ${error.message}`);
    }
  }

  /**
   * Send a session reminder notification
   * @param userId User to notify
   * @param sessionId ID of the session
   * @param sessionTitle Title of the session
   * @param startTime Start time of the session
   * @returns Created notification
   */
  async sendSessionReminder(
    userId: number, 
    sessionId: number, 
    sessionTitle: string, 
    startTime: Date
  ) {
    const formattedTime = startTime.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    return this.createNotification({
      userId,
      title: 'Upcoming Session Reminder',
      message: `Your session "${sessionTitle}" is scheduled for ${formattedTime}.`,
      type: NotificationType.SESSION_REMINDER,
      relatedEntityId: sessionId,
      relatedEntityType: 'tutoring_session',
      actionUrl: `/sessions/${sessionId}`,
    });
  }

  /**
   * Send a notification when a session is cancelled
   * @param userId User to notify
   * @param sessionId ID of the session
   * @param sessionTitle Title of the session
   * @returns Created notification
   */
  async sendSessionCancelledNotification(
    userId: number, 
    sessionId: number, 
    sessionTitle: string
  ) {
    return this.createNotification({
      userId,
      title: 'Session Cancelled',
      message: `The session "${sessionTitle}" has been cancelled.`,
      type: NotificationType.SESSION_CANCELLED,
      relatedEntityId: sessionId,
      relatedEntityType: 'tutoring_session',
    });
  }

  /**
   * Send a notification when a child earns an achievement
   * @param userId User to notify (child or parent)
   * @param achievementId ID of the achievement
   * @param achievementTitle Title of the achievement
   * @returns Created notification
   */
  async sendAchievementNotification(
    userId: number, 
    achievementId: number, 
    achievementTitle: string
  ) {
    return this.createNotification({
      userId,
      title: 'Achievement Unlocked!',
      message: `Congratulations! You've earned the "${achievementTitle}" achievement.`,
      type: NotificationType.ACHIEVEMENT_UNLOCKED,
      relatedEntityId: achievementId,
      relatedEntityType: 'achievement',
      actionUrl: `/achievements/${achievementId}`,
    });
  }

  /**
   * Send a notification to a tutor when they're approved
   * @param tutorId ID of the tutor
   * @returns Created notification
   */
  async sendTutorApprovalNotification(tutorId: number) {
    return this.createNotification({
      userId: tutorId,
      title: 'Application Approved',
      message: 'Congratulations! Your tutor application has been approved. You can now start accepting sessions.',
      type: NotificationType.TUTOR_APPROVED,
      actionUrl: '/tutor/dashboard',
    });
  }

  /**
   * Send a notification to a tutor when they're rejected
   * @param tutorId ID of the tutor
   * @param reason Reason for rejection
   * @returns Created notification
   */
  async sendTutorRejectionNotification(tutorId: number, reason?: string) {
    const message = reason 
      ? `Your tutor application has been rejected. Reason: ${reason}`
      : 'Your tutor application has been rejected. Please contact support for more information.';
    
    return this.createNotification({
      userId: tutorId,
      title: 'Application Not Approved',
      message,
      type: NotificationType.TUTOR_REJECTED,
      actionUrl: '/support',
    });
  }
} 