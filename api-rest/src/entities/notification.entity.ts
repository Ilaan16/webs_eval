import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { Reservation } from './reservation.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Reservation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;

  @RelationId((notification: Notification) => notification.reservation)
  reservationId: number;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'timestamp' })
  notification_date: Date;

  @Column({ type: 'boolean', default: false })
  is_sent: boolean;
}
