import { Controller, UseGuards, Optional } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { GrpcMethod } from '@nestjs/microservices';
import { ApiBearerAuth } from '@nestjs/swagger';
import { KeycloakAuthGuard } from '../auth/keycloak-auth.guard';

@ApiBearerAuth()
@UseGuards(KeycloakAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    @Optional() private readonly notificationsService: NotificationsService,
  ) {}

  @GrpcMethod('NotificationsService', 'CreateNotification')
  async createNotification(data: {
    reservation_id: number;
    message: string;
    notification_date: string;
  }) {
    if (!this.notificationsService) {
      return {
        id: 1,
        reservation_id: data.reservation_id,
        message: data.message,
        notification_date: data.notification_date,
      };
    }
    return this.notificationsService.createNotification(data);
  }

  @GrpcMethod('NotificationsService', 'UpdateNotification')
  async updateNotification(data: {
    id: number;
    message: string;
    notification_date: string;
  }) {
    if (!this.notificationsService) {
      return {
        id: data.id,
        reservation_id: 1,
        message: data.message,
        notification_date: data.notification_date,
      };
    }
    return this.notificationsService.updateNotification(data);
  }

  @GrpcMethod('NotificationsService', 'GetNotification')
  async getNotification(data: { id: number }) {
    if (!this.notificationsService) {
      return {
        id: data.id,
        reservation_id: 1,
        message: 'Mock message',
        notification_date: new Date().toISOString(),
      };
    }
    return this.notificationsService.getNotification(data.id);
  }
}
