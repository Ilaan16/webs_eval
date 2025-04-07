import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { GrpcMethod } from '@nestjs/microservices';

@Injectable()
export class NotificationsService {
  private notifications = new Map();
  private userNotifications = new Map();

  @GrpcMethod('NotificationService', 'SendNotification')
  sendNotification(data: { user_id: string; title: string; content: string; type: string }) {
    const notificationId = crypto.randomUUID();
    const notification = {
      id: notificationId,
      user_id: data.user_id,
      title: data.title,
      content: data.content,
      type: data.type,
      read: false,
      created_at: new Date().toISOString(),
    };

    this.notifications.set(notificationId, notification);

    if (!this.userNotifications.has(data.user_id)) {
      this.userNotifications.set(data.user_id, []);
    }
    this.userNotifications.get(data.user_id).push(notification);

    return {
      success: true,
      message: 'Notification sent successfully',
      notification_id: notificationId,
    };
  }

  @GrpcMethod('NotificationService', 'GetNotifications')
  getNotifications(data: { user_id: string }) {
    const notifications = this.userNotifications.get(data.user_id) || [];
    return { notifications };
  }
} 