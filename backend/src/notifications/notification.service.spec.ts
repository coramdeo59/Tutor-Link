import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { DATABASE_CONNECTION } from '../core/database-connection';
import { NotificationType } from './schema/notification.schema';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('NotificationService', () => {
  let service: NotificationService;
  let mockDatabase: any;

  beforeEach(async () => {
    // Create mock database functions
    mockDatabase = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      returning: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: DATABASE_CONNECTION,
          useValue: mockDatabase,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNotification', () => {
    it('should create a notification successfully', async () => {
      // Mock user exists
      mockDatabase.returning.mockResolvedValueOnce([{ userId: 1 }]);
      
      // Mock notification creation
      mockDatabase.returning.mockResolvedValueOnce([
        {
          notificationId: 1,
          userId: 1,
          title: 'Test Notification',
          message: 'This is a test',
          type: NotificationType.SYSTEM_ANNOUNCEMENT,
          read: false,
          createdAt: new Date(),
        },
      ]);

      const result = await service.createNotification({
        userId: 1,
        title: 'Test Notification',
        message: 'This is a test',
        type: NotificationType.SYSTEM_ANNOUNCEMENT,
      });

      expect(result).toHaveProperty('notificationId', 1);
      expect(result).toHaveProperty('userId', 1);
      expect(result).toHaveProperty('title', 'Test Notification');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Mock user does not exist
      mockDatabase.returning.mockResolvedValueOnce([]);

      await expect(
        service.createNotification({
          userId: 999,
          title: 'Test Notification',
          message: 'This is a test',
          type: NotificationType.SYSTEM_ANNOUNCEMENT,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserNotifications', () => {
    it('should return user notifications with counts', async () => {
      // Mock user exists
      mockDatabase.returning.mockResolvedValueOnce([{ userId: 1 }]);
      
      // Mock notifications
      const mockNotifications = [
        {
          notificationId: 1,
          userId: 1,
          title: 'Test Notification 1',
          message: 'This is test 1',
          type: NotificationType.SYSTEM_ANNOUNCEMENT,
          read: false,
          createdAt: new Date(),
        },
        {
          notificationId: 2,
          userId: 1,
          title: 'Test Notification 2',
          message: 'This is test 2',
          type: NotificationType.SESSION_REMINDER,
          read: true,
          createdAt: new Date(),
        },
      ];
      
      mockDatabase.returning.mockResolvedValueOnce(mockNotifications);
      
      // Mock unread count
      mockDatabase.returning.mockResolvedValueOnce([{ count: 1 }]);

      const result = await service.getUserNotifications(1);

      expect(result).toHaveProperty('notifications');
      expect(result.notifications).toHaveLength(2);
      expect(result).toHaveProperty('unreadCount', 1);
      expect(result).toHaveProperty('totalCount', 2);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Mock user does not exist
      mockDatabase.returning.mockResolvedValueOnce([]);

      await expect(service.getUserNotifications(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('markNotificationsAsRead', () => {
    it('should mark notifications as read', async () => {
      // Mock update result
      mockDatabase.returning.mockResolvedValueOnce([
        { notificationId: 1 },
        { notificationId: 2 },
      ]);

      const result = await service.markNotificationsAsRead(1, [1, 2]);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('markedAsRead', 2);
      expect(result).toHaveProperty('notificationIds');
      expect(result.notificationIds).toEqual([1, 2]);
    });

    it('should throw BadRequestException when no notification IDs provided', async () => {
      await expect(service.markNotificationsAsRead(1, [])).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('should mark all notifications as read', async () => {
      // Mock update result
      mockDatabase.returning.mockResolvedValueOnce([
        { notificationId: 1 },
        { notificationId: 2 },
        { notificationId: 3 },
      ]);

      const result = await service.markAllNotificationsAsRead(1);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('markedAsRead', 3);
    });
  });

  describe('deleteExpiredNotifications', () => {
    it('should delete expired notifications', async () => {
      // Mock delete result
      mockDatabase.returning.mockResolvedValueOnce([
        { notificationId: 1 },
        { notificationId: 2 },
      ]);

      const result = await service.deleteExpiredNotifications();

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('deletedCount', 2);
    });
  });

  describe('helper methods', () => {
    it('should send session reminder notification', async () => {
      // Mock createNotification
      jest.spyOn(service, 'createNotification').mockResolvedValueOnce({
        notificationId: 1,
        userId: 1,
        title: 'Upcoming Session Reminder',
        message: expect.stringContaining('Math Session'),
        type: NotificationType.SESSION_REMINDER,
        read: false,
        createdAt: new Date(),
      });

      const result = await service.sendSessionReminder(
        1,
        123,
        'Math Session',
        new Date('2023-06-15T15:00:00Z'),
      );

      expect(result).toHaveProperty('notificationId', 1);
      expect(result).toHaveProperty('type', NotificationType.SESSION_REMINDER);
      expect(result.message).toContain('Math Session');
    });

    it('should send achievement notification', async () => {
      // Mock createNotification
      jest.spyOn(service, 'createNotification').mockResolvedValueOnce({
        notificationId: 1,
        userId: 1,
        title: 'Achievement Unlocked!',
        message: expect.stringContaining('Math Master'),
        type: NotificationType.ACHIEVEMENT_UNLOCKED,
        read: false,
        createdAt: new Date(),
      });

      const result = await service.sendAchievementNotification(
        1,
        123,
        'Math Master',
      );

      expect(result).toHaveProperty('notificationId', 1);
      expect(result).toHaveProperty('type', NotificationType.ACHIEVEMENT_UNLOCKED);
      expect(result.message).toContain('Math Master');
    });
  });
}); 