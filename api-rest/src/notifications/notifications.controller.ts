import {Controller, UseGuards} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { GrpcMethod } from '@nestjs/microservices';
import {ApiBearerAuth} from "@nestjs/swagger";
import {KeycloakAuthGuard} from "../auth/keycloak-auth.guard";

@ApiBearerAuth()
@UseGuards(KeycloakAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @GrpcMethod('NotificationsService', 'CreateNotification')
  async createNotification(data: {
    reservation_id: number;
    message: string;
    notification_date: string;
  }) {
    return this.notificationsService.createNotification(data);
  }

  @GrpcMethod('NotificationsService', 'UpdateNotification')
  async updateNotification(data: {
    id: number;
    message: string;
    notification_date: string;
  }) {
    return this.notificationsService.updateNotification(data);
  }

  @GrpcMethod('NotificationsService', 'GetNotification')
  async getNotification(data: { id: number }) {
    return this.notificationsService.getNotification(data.id);
  }
}
