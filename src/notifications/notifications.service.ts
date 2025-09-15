import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from 'src/users/entities/user.entity';

// Define a type for creating notifications
export type CreateNotificationPayload = {
  userId: string;
  type: string;
  title: string;
  description: string;
};

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) { }

  // Get all notifications for a specific user
  async getNotificationsForUser(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' }, // Show newest first
    });
  }

  // Mark a single notification as read
  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id: notificationId, user: { id: userId } },
    });
    if (!notification) {
      throw new UnauthorizedException('Notification not found or access denied');
    }
    notification.isRead = true;
    return this.notificationsRepository.save(notification);
  }

  // Mark all of a user's notifications as read
  async markAllAsRead(userId: string): Promise<{ affected: number }> {
    const result = await this.notificationsRepository.update(
      { user: { id: userId }, isRead: false },
      { isRead: true },
    );
    return { affected: result.affected || 0 };
  }

  // Create a new notification (to be called from other services)
  async create(payload: CreateNotificationPayload): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      ...payload,
      user: { id: payload.userId } as User,
    });
    return this.notificationsRepository.save(notification);
  }

  // Add this function inside your NotificationsService class

  /**
   * Gets the total count of unread notifications for a specific user.
   */
  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.notificationsRepository.count({
      where: {
        user: { id: userId },
        isRead: false,
      },
    });
    return { count };
  }
}