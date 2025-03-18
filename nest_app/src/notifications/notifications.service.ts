import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import {
  CreateNotificationDto,
  UpdateNotificationDto,
} from '../dto/notifications.dto';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

interface NotificationGrpcService {
  createNotification(data: {
    reservation_id: number;
    message: string;
    notification_date: string;
  }): Observable<{
    id: number;
    reservation_id: number;
    message: string;
    notification_date: string;
  }>;
  updateNotification(data: {
    id: number;
    message: string;
    notification_date: string;
  }): Observable<{
    id: number;
    reservation_id: number;
    message: string;
    notification_date: string;
  }>;
  getNotification(data: { id: number }): Observable<{
    id: number;
    reservation_id: number;
    message: string;
    notification_date: string;
  }>;
}

@Injectable()
export class NotificationsService {
  private notificationService: NotificationGrpcService;

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @Inject('NOTIFICATIONS_PACKAGE') private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.notificationService = this.client.getService<NotificationGrpcService>(
      'NotificationsService',
    );
  }

  async findAll({ skip = 0, limit = 10 }): Promise<Notification[]> {
    return this.notificationRepository.find({ skip, take: limit });
  }

  async findOne(id: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create(
      createNotificationDto,
    );
    return this.notificationRepository.save(notification);
  }

  async update(
    id: number,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    await this.findOne(id);
    await this.notificationRepository.update(id, updateNotificationDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.notificationRepository.delete(id);
  }

  private toGrpcResponse(notification: Notification) {
    return {
      id: notification.id,
      reservation_id: notification.reservationId,
      message: notification.message,
      notification_date: notification.notification_date.toISOString(),
    };
  }

  async createNotification(data: {
    reservation_id: number;
    message: string;
    notification_date: string;
  }) {
    const notification = await this.create({
      reservation_id: data.reservation_id,
      message: data.message,
      notification_date: new Date(data.notification_date),
    });
    return this.toGrpcResponse(notification);
  }

  async updateNotification(data: {
    id: number;
    message: string;
    notification_date: string;
  }) {
    const notification = await this.update(data.id, {
      message: data.message,
      is_sent: false,
    });
    return this.toGrpcResponse(notification);
  }

  async getNotification(id: number) {
    const notification = await this.findOne(id);
    return this.toGrpcResponse(notification);
  }
}
