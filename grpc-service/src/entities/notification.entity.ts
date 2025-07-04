import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  RelationId,
} from "typeorm";
import { Reservation } from "./reservation.entity";

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Reservation, { onDelete: "CASCADE" })
  @JoinColumn({ name: "reservation_id" })
  reservation: Reservation;

  @RelationId((notification: Notification) => notification.reservation)
  reservationId: number;

  @Column("text")
  message: string;

  @Column({ type: "boolean", default: false, name: "is_sent" })
  isSent: boolean;

  @Column({ name: "notification_date", type: "timestamp" })
  notificationDate: Date;
}
