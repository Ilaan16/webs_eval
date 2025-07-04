import {
  Injectable,
  NotFoundException,
  Inject,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import {
  CreateNotificationDto,
  UpdateNotificationDto,
} from '../dto/notifications.dto';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, of } from 'rxjs';

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

// Mock pour les tests
class MockNotificationRepository {
  private notifications: Notification[] = [];
  private nextId = 1;

  async find({ skip = 0, take = 10 }): Promise<Notification[]> {
    return this.notifications.slice(skip, skip + take);
  }

  async findOne({ where: { id } }): Promise<Notification | null> {
    return this.notifications.find((n) => n.id === id) || null;
  }

  create(data: CreateNotificationDto): Notification {
    const partial = {
      id: 0,
      reservationId: data.reservation_id,
      message: data.message,
      notification_date: data.notification_date,
      is_sent: false,
    };

    return partial as unknown as Notification;
  }

  async save(notification: Notification): Promise<Notification> {
    if (!notification.id) {
      notification.id = this.nextId++;
      this.notifications.push(notification);
    } else {
      const index = this.notifications.findIndex(
        (n) => n.id === notification.id,
      );
      if (index >= 0) {
        this.notifications[index] = notification;
      }
    }
    return notification;
  }

  async update(id: number, data: Partial<Notification>): Promise<void> {
    const notification = await this.findOne({ where: { id } });
    if (notification) {
      Object.assign(notification, data);
    }
  }

  async delete(id: number): Promise<void> {
    const index = this.notifications.findIndex((n) => n.id === id);
    if (index >= 0) {
      this.notifications.splice(index, 1);
    }
  }
}

class MockNotificationGrpcService implements NotificationGrpcService {
  createNotification(data: {
    reservation_id: number;
    message: string;
    notification_date: string;
  }): Observable<{
    id: number;
    reservation_id: number;
    message: string;
    notification_date: string;
  }> {
    return of({
      id: 1,
      reservation_id: data.reservation_id,
      message: data.message,
      notification_date: data.notification_date,
    });
  }

  updateNotification(data: {
    id: number;
    message: string;
    notification_date: string;
  }): Observable<{
    id: number;
    reservation_id: number;
    message: string;
    notification_date: string;
  }> {
    return of({
      id: data.id,
      reservation_id: 1,
      message: data.message,
      notification_date: data.notification_date,
    });
  }

  getNotification(data: { id: number }): Observable<{
    id: number;
    reservation_id: number;
    message: string;
    notification_date: string;
  }> {
    return of({
      id: data.id,
      reservation_id: 1,
      message: 'Test notification',
      notification_date: new Date().toISOString(),
    });
  }
}

@Injectable()
export class NotificationsService {
  private notificationService: NotificationGrpcService;
  private notificationRepository: Repository<Notification>;

  constructor(
    @Optional()
    @InjectRepository(Notification)
    private readonly injectedRepository?: Repository<Notification>,
    @Optional() @Inject('NOTIFICATIONS_PACKAGE') private client?: ClientGrpc,
  ) {
    // Utiliser le repository injecté ou créer un mock repository pour les tests
    this.notificationRepository =
      this.injectedRepository ||
      (new MockNotificationRepository() as unknown as Repository<Notification>);

    // Mock service si client n'est pas fourni (pour les tests)
    if (!this.client) {
      this.notificationService = new MockNotificationGrpcService();
    }
  }

  onModuleInit() {
    if (this.client) {
      this.notificationService =
        this.client.getService<NotificationGrpcService>('NotificationsService');
    }
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
    const notificationData = {
      reservation: { id: createNotificationDto.reservation_id },
      message: createNotificationDto.message,
      notification_date: createNotificationDto.notification_date,
      // is_sent aura sa valeur par défaut de l'entité (false)
    };
    const notification = this.notificationRepository.create(
      notificationData,
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
