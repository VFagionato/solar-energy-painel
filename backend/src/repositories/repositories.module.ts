import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Address } from '../entities/address.entity';
import { Sensor } from '../entities/sensor.entity';
import { Event } from '../entities/event.entity';
import { getRepositoryProviders } from './repository.config';

/**
 * Repositories Module
 * 
 * This module is responsible for configuring the repository layer
 * and providing dependency injection for repository interfaces.
 * It abstracts the database implementation details from the service layer.
 * 
 * Repository implementations can be easily switched using environment variables
 * or by modifying the repository configuration.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Address, Sensor, Event]),
  ],
  providers: [
    ...getRepositoryProviders(),
    // Additional repository providers will be automatically included
    // as they are implemented and configured
  ],
  exports: [
    'USER_REPOSITORY',
    // Export other repository tokens here as they are implemented
    // 'ADDRESS_REPOSITORY',
    // 'SENSOR_REPOSITORY', 
    // 'EVENT_REPOSITORY',
  ],
})
export class RepositoriesModule {}