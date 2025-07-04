import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { Expose, Type } from 'class-transformer';
import { User } from './user.entity';
import { Room } from './room.entity';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  @Expose()
  @Type(() => User)
  user: User;

  @RelationId((reservation: Reservation) => reservation.user)
  userId: number;

  @ManyToOne(() => Room)
  @JoinColumn({ name: 'room_id' })
  @Expose()
  @Type(() => Room)
  room: Room;

  @RelationId((reservation: Reservation) => reservation.room)
  roomId: number;

  @Column({ type: 'timestamp' })
  @Expose({ name: 'startTime' })
  start_time: Date;

  @Column({ type: 'timestamp' })
  @Expose({ name: 'endTime' })
  end_time: Date;

  @Column({ type: 'varchar', length: 20 })
  @Expose()
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';

  @CreateDateColumn({ type: 'timestamp' })
  @Expose({ name: 'createdAt' })
  created_at: Date;
}
