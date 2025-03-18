import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Reservation, (reservation) => reservation.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'timestamp' })
  notification_date: Date;

  @Column({ type: 'boolean', default: false })
  is_sent: boolean;
}
