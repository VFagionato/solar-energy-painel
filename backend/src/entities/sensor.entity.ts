import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Address } from './address.entity';
import { Event } from './event.entity';

@Entity('sensors')
export class Sensor {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'uuid', name: 'equip_address_uuid' })
  equip_address_uuid: string;

  @Column({ type: 'int', default: 0 })
  total_events: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  angle: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  power_generate: number;

  @Column({ type: 'timestamp', nullable: true })
  last_shutdown: Date;

  @Column({ type: 'int', default: 0 })
  total_shutdown: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.sensors)
  @JoinColumn({ name: 'user_uuid' })
  user: User;

  @ManyToOne(() => Address, (address) => address.sensors)
  @JoinColumn({ name: 'equip_address_uuid' })
  location: Address;

  @OneToMany(() => Event, (event) => event.sensor)
  events: Event[];
}