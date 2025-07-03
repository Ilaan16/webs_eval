import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity("reservations")
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "user_id" })
  userId: number;

  @Column({ name: "room_id" })
  roomId: number;

  @Column({ name: "start_time", type: "timestamp" })
  startTime: Date;

  @Column({ name: "end_time", type: "timestamp" })
  endTime: Date;

  @Column({ default: "pending" })
  status: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;
}
