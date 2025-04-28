import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  keycloak_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
