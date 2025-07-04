import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { NotificationService } from "./notification.service";

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @GrpcMethod("NotificationService", "CreateNotification")
  async createNotification(data: {
    reservationId: number;
    message: string;
    notificationDate: string;
  }) {
    return this.notificationService.createNotification(data);
  }

  @GrpcMethod("NotificationService", "UpdateNotification")
  async updateNotification(data: {
    id: string;
    message: string;
    notificationDate: string;
  }) {
    return this.notificationService.updateNotification(data);
  }

  @GrpcMethod("NotificationService", "GetNotification")
  async getNotification(data: { id: string }) {
    return this.notificationService.getNotification(data.id);
  }
}
