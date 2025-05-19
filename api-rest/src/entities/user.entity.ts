import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Expose({ name: 'keycloakId' })
  keycloak_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  email?: string;

  @Column({ nullable: true })
  @Expose()
  username?: string;

  @Column({ select: false, nullable: true })
  password?: string;

  @Column({ nullable: true })
  @Expose()
  firstName?: string;

  @Column({ nullable: true })
  @Expose()
  lastName?: string;

  @CreateDateColumn({ type: 'timestamp' })
  @Expose({ name: 'createdAt' })
  created_at: Date;
}
