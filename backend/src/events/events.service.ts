import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Event } from '../entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { SearchEventDto } from './dto/search-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const event = this.eventRepository.create({
      ...createEventDto,
      timestamp: new Date(createEventDto.timestamp),
    });
    return await this.eventRepository.save(event);
  }

  async findAll(): Promise<Event[]> {
    return await this.eventRepository.find({
      relations: ['sensor'],
      order: { timestamp: 'DESC' },
    });
  }

  async findOne(uuid: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { uuid },
      relations: ['sensor'],
    });

    if (!event) {
      throw new NotFoundException(`Event with UUID ${uuid} not found`);
    }

    return event;
  }

  async findBySensor(sensorUuid: string): Promise<Event[]> {
    return await this.eventRepository.find({
      where: { sensor_uuid: sensorUuid },
      relations: ['sensor'],
      order: { timestamp: 'DESC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    return await this.eventRepository.find({
      where: {
        timestamp: Between(startDate, endDate),
      },
      relations: ['sensor'],
      order: { timestamp: 'DESC' },
    });
  }

  async findBySensorAndDateRange(
    sensorUuid: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Event[]> {
    return await this.eventRepository.find({
      where: {
        sensor_uuid: sensorUuid,
        timestamp: Between(startDate, endDate),
      },
      relations: ['sensor'],
      order: { timestamp: 'DESC' },
    });
  }

  async update(uuid: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(uuid);

    if ('timestamp' in updateEventDto && updateEventDto.timestamp) {
      updateEventDto.timestamp = new Date(updateEventDto.timestamp).toISOString() as any;
    }

    Object.assign(event, updateEventDto);
    return await this.eventRepository.save(event);
  }

  async remove(uuid: string): Promise<void> {
    const event = await this.findOne(uuid);
    await this.eventRepository.remove(event);
  }

  async getStatsBySensor(sensorUuid: string): Promise<{
    totalEvents: number;
    totalPowerGenerated: number;
    averagePowerGenerated: number;
    averageHeat: number;
    lastEvent: Date | null;
  }> {
    const events = await this.findBySensor(sensorUuid);

    if (events.length === 0) {
      return {
        totalEvents: 0,
        totalPowerGenerated: 0,
        averagePowerGenerated: 0,
        averageHeat: 0,
        lastEvent: null,
      };
    }

    const totalPowerGenerated = events.reduce(
      (sum, event) => sum + parseFloat(event.power_generated.toString()),
      0,
    );
    const totalHeat = events.reduce(
      (sum, event) => sum + parseFloat(event.heat.toString()),
      0,
    );

    return {
      totalEvents: events.length,
      totalPowerGenerated,
      averagePowerGenerated: totalPowerGenerated / events.length,
      averageHeat: totalHeat / events.length,
      lastEvent: events[0]?.timestamp || null,
    };
  }

  async search(searchEventDto: SearchEventDto): Promise<Event[]> {
    const queryBuilder = this.eventRepository.createQueryBuilder('event')
      .leftJoinAndSelect('event.sensor', 'sensor');

    if (searchEventDto.sensor_uuid) {
      queryBuilder.andWhere('event.sensor_uuid = :sensorUuid', { 
        sensorUuid: searchEventDto.sensor_uuid 
      });
    }

    if (searchEventDto.min_power_generated !== undefined) {
      queryBuilder.andWhere('event.power_generated >= :minPowerGenerated', { 
        minPowerGenerated: searchEventDto.min_power_generated 
      });
    }

    if (searchEventDto.max_power_generated !== undefined) {
      queryBuilder.andWhere('event.power_generated <= :maxPowerGenerated', { 
        maxPowerGenerated: searchEventDto.max_power_generated 
      });
    }

    if (searchEventDto.start_date) {
      queryBuilder.andWhere('event.timestamp >= :startDate', { 
        startDate: new Date(searchEventDto.start_date) 
      });
    }

    if (searchEventDto.end_date) {
      queryBuilder.andWhere('event.timestamp <= :endDate', { 
        endDate: new Date(searchEventDto.end_date) 
      });
    }

    if (searchEventDto.min_heat !== undefined) {
      queryBuilder.andWhere('event.heat >= :minHeat', { 
        minHeat: searchEventDto.min_heat 
      });
    }

    if (searchEventDto.max_heat !== undefined) {
      queryBuilder.andWhere('event.heat <= :maxHeat', { 
        maxHeat: searchEventDto.max_heat 
      });
    }

    return await queryBuilder
      .orderBy('event.timestamp', 'DESC')
      .getMany();
  }
}