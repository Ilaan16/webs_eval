import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "reservation_id" })
  reservationId: number;

  @Column()
  message: string;

  @Column({ default: false, name: "is_sent" })
  isSent: boolean;

  @Column({ name: "notification_date", type: "timestamp" })
  notificationDate: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
