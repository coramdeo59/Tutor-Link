import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Param,
  ParseIntPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthType } from '../auth/authentication/enums/auth-type.enum';
import { Auth } from '../auth/authentication/decorators/auth-decorator';
import { ActiveUser } from '../auth/Decorators/active-user.decorator';
import { ActiveUserData } from '../auth/interfaces/active-user-data.interface';
import { Role } from '../users/enums/role-enums';
import { CreateNotificationDto, MarkNotificationsReadDto, NotificationFilterDto, BulkNotificationDto } from './dto/notification.dto';

@Auth(AuthType.Bearer)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Get notifications for the authenticated user
   * @param activeUser The authenticated user
   * @param filters Optional filters for the notifications
   * @returns List of notifications
   */
  @Get()
  async getMyNotifications(
    @ActiveUser() activeUser: ActiveUserData,
    @Query() filters: NotificationFilterDto,
  ) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    const userId = Number(activeUser.sub);
    return this.notificationService.getUserNotifications(userId, filters);
  }

  /**
   * Mark specific notifications as read for the authenticated user
   * @param activeUser The authenticated user
   * @param markReadDto Data containing notification IDs to mark as read
   * @returns Success result
   */
  @Put('read')
  async markNotificationsAsRead(
    @ActiveUser() activeUser: ActiveUserData,
    @Body() markReadDto: MarkNotificationsReadDto,
  ) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    const userId = Number(activeUser.sub);
    
    if (markReadDto.markAll) {
      return this.notificationService.markAllNotificationsAsRead(userId);
    }
    
    if (!markReadDto.notificationIds || markReadDto.notificationIds.length === 0) {
      throw new UnauthorizedException('No notification IDs provided to mark as read');
    }
    
    return this.notificationService.markNotificationsAsRead(userId, markReadDto.notificationIds);
  }

  /**
   * Create a notification (admin only)
   * @param activeUser The authenticated user
   * @param createNotificationDto Data for the new notification
   * @returns Created notification
   */
  @Post('create')
  async createNotification(
    @ActiveUser() activeUser: ActiveUserData,
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Only admins can create notifications for any user
    if (activeUser.role !== Role.Admin) {
      throw new UnauthorizedException('Only admin users can create notifications');
    }

    return this.notificationService.createNotification(createNotificationDto);
  }

  /**
   * Send bulk notifications to multiple users (admin only)
   * @param activeUser The authenticated user
   * @param bulkNotificationDto Data for the bulk notification
   * @returns Result with count of notifications created
   */
  @Post('bulk')
  async sendBulkNotifications(
    @ActiveUser() activeUser: ActiveUserData,
    @Body() bulkNotificationDto: BulkNotificationDto,
  ) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Only admins can send bulk notifications
    if (activeUser.role !== Role.Admin) {
      throw new UnauthorizedException('Only admin users can send bulk notifications');
    }

    return this.notificationService.sendBulkNotifications(bulkNotificationDto);
  }

  /**
   * Clean up expired notifications (admin only)
   * @param activeUser The authenticated user
   * @returns Result with count of deleted notifications
   */
  @Delete('expired')
  async cleanupExpiredNotifications(@ActiveUser() activeUser: ActiveUserData) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Only admins can clean up expired notifications
    if (activeUser.role !== Role.Admin) {
      throw new UnauthorizedException('Only admin users can clean up expired notifications');
    }

    return this.notificationService.deleteExpiredNotifications();
  }

  /**
   * Get notification count for the authenticated user
   * Shows only unread notifications
   * @param activeUser The authenticated user
   * @returns Unread notification count
   */
  @Get('count')
  async getUnreadNotificationCount(@ActiveUser() activeUser: ActiveUserData) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    const userId = Number(activeUser.sub);
    const result = await this.notificationService.getUserNotifications(userId, { unreadOnly: true });
    
    return {
      unreadCount: result.unreadCount,
    };
  }

  /**
   * Get notifications for a specific user (admin only)
   * @param activeUser The authenticated user
   * @param userId ID of the user to get notifications for
   * @param filters Optional filters for the notifications
   * @returns List of notifications
   */
  @Get('user/:userId')
  async getUserNotifications(
    @ActiveUser() activeUser: ActiveUserData,
    @Param('userId', ParseIntPipe) userId: number,
    @Query() filters: NotificationFilterDto,
  ) {
    if (!activeUser || !activeUser.sub) {
      throw new UnauthorizedException('Authentication required');
    }

    // Only admins can view notifications for other users
    if (activeUser.role !== Role.Admin) {
      throw new UnauthorizedException('Only admin users can view notifications for other users');
    }

    return this.notificationService.getUserNotifications(userId, filters);
  }
} 