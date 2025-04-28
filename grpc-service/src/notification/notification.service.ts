import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Notification } from "../entities/notification.entity";

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>
  ) {}

  async createNotification(data: {
    reservationId: number;
    message: string;
    notificationDate: string;
  }) {
    const notification = this.notificationRepository.create({
      reservationId: data.reservationId,
      message: data.message,
      notificationDate: new Date(data.notificationDate),
      isSent: false,
    });

    await this.notificationRepository.save(notification);

    return {
      id: notification.id.toString(),
      reservationId: notification.reservationId,
      message: notification.message,
      notificationDate: notification.notificationDate.toISOString(),
    };
  }

  async updateNotification(data: {
    id: string;
    message: string;
    notificationDate: string;
  }) {
    const notification = await this.notificationRepository.findOne({
      where: { id: parseInt(data.id, 10) },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${data.id} not found`);
    }

    notification.message = data.message;
    notification.notificationDate = new Date(data.notificationDate);
    notification.isSent = false;

    await this.notificationRepository.save(notification);

    return {
      id: notification.id.toString(),
      reservationId: notification.reservationId,
      message: notification.message,
      notificationDate: notification.notificationDate.toISOString(),
    };
  }

  async getNotification(id: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: parseInt(id, 10) },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return {
      id: notification.id.toString(),
      reservationId: notification.reservationId,
      message: notification.message,
      notificationDate: notification.notificationDate.toISOString(),
    };
  }
}
