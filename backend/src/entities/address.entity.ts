import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { User } from './user.entity';
import { Sensor } from './sensor.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'uuid', nullable: true })
  user_uuid: string;

  @Column({ type: 'uuid', nullable: true })
  sensor_uuid: string;

  @Column({ type: 'varchar', length: 200 })
  street: string;

  @Column({ type: 'varchar', length: 20 })
  number: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 50 })
  state: string;

  @Column({ type: 'varchar', length: 20 })
  zipcode: string;

  @Column({ type: 'varchar', length: 100 })
  country: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => User, (user) => user.address)
  user: User;

  @OneToMany(() => Sensor, (sensor) => sensor.location)
  sensors: Sensor[];

  @BeforeInsert()
  @BeforeUpdate()
  validateUserOrSensorUuid() {
    const hasUserUuid = this.user_uuid != null && this.user_uuid.trim() !== '';
    const hasSensorUuid = this.sensor_uuid != null && this.sensor_uuid.trim() !== '';

    if (!hasUserUuid && !hasSensorUuid) {
      throw new Error('Address must have either user_uuid or sensor_uuid');
    }

    if (hasUserUuid && hasSensorUuid) {
      throw new Error('Address cannot have both user_uuid and sensor_uuid');
    }
  }
}