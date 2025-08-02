import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Address } from './address.entity';
import { Sensor } from './sensor.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  last_name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  document: string;

  @Column({ type: 'uuid', nullable: true })
  address_uuid: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Address, (address) => address.user)
  @JoinColumn({ name: 'address_uuid' })
  address: Address;

  @OneToMany(() => Sensor, (sensor) => sensor.user)
  sensors: Sensor[];
}