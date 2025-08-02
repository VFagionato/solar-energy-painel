import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Sensor } from './sensor.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'uuid' })
  sensor_uuid: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  power_generated: number;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  heat: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Sensor, (sensor) => sensor.events)
  @JoinColumn({ name: 'sensor_uuid' })
  sensor: Sensor;
}