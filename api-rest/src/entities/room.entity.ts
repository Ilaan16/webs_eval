import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'int', default: 0 })
  capacity: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
