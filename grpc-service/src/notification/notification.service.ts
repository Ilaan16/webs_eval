import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Notification } from "../entities/notification.entity";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>
  ) {}

  async createNotification(data: {
    reservationId: number;
    message: string;
    notificationDate: string;
  }) {
    this.logger.log(`Creating notification with data: ${JSON.stringify(data)}`);
    const notification = this.notificationRepository.create({
      reservation: { id: data.reservationId },
      message: data.message,
      notificationDate: new Date(data.notificationDate),
      isSent: false,
    });

    this.logger.log('Saving notification...');
    await this.notificationRepository.save(notification);
    this.logger.log('Notification saved.');

    const reservationId = notification.reservationId || (notification.reservation as any)?.id;

    return {
      id: notification.id.toString(),
      reservationId: reservationId,
      message: notification.message,
      notificationDate: notification.notificationDate.toISOString(),
    };
  }

  async updateNotification(data: {
    id: string;
    message: string;
    notificationDate: string;
  }) {
    this.logger.log(`Updating notification with data: ${JSON.stringify(data)}`);
    const notification = await this.notificationRepository.findOne({
      where: { id: parseInt(data.id, 10) },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${data.id} not found`);
    }

    notification.message = data.message;
    notification.notificationDate = new Date(data.notificationDate);
    notification.isSent = false;

    this.logger.log('Updating notification...');
    await this.notificationRepository.save(notification);
    this.logger.log('Notification updated.');

    const reservationId = notification.reservationId || (notification.reservation as any)?.id;

    return {
      id: notification.id.toString(),
      reservationId: reservationId,
      message: notification.message,
      notificationDate: notification.notificationDate.toISOString(),
    };
  }

  async getNotification(id: string) {
    this.logger.log(`Getting notification with id: ${id}`);
    const notification = await this.notificationRepository.findOne({
      where: { id: parseInt(id, 10) },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    this.logger.log(`Found notification: ${JSON.stringify(notification)}`);

    const reservationId = notification.reservationId || (notification.reservation as any)?.id;

    return {
      id: notification.id.toString(),
      reservationId: reservationId,
      message: notification.message,
      notificationDate: notification.notificationDate.toISOString(),
    };
  }
}
