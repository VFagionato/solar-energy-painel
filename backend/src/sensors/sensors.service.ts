import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between } from 'typeorm';
import { Sensor } from '../entities/sensor.entity';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';
import { SearchSensorDto } from './dto/search-sensor.dto';

@Injectable()
export class SensorsService {
  constructor(
    @InjectRepository(Sensor)
    private readonly sensorRepository: Repository<Sensor>,
  ) {}

  async create(createSensorDto: CreateSensorDto): Promise<Sensor> {
    const existingSensor = await this.sensorRepository.findOne({
      where: { code: createSensorDto.code },
    });

    if (existingSensor) {
      throw new ConflictException('Sensor with this code already exists');
    }

    const sensor = this.sensorRepository.create(createSensorDto);
    return await this.sensorRepository.save(sensor);
  }

  async findAll(): Promise<Sensor[]> {
    return await this.sensorRepository.find({
      relations: ['user', 'location', 'events'],
    });
  }

  async findOne(uuid: string): Promise<Sensor> {
    const sensor = await this.sensorRepository.findOne({
      where: { uuid },
      relations: ['user', 'location', 'events'],
    });

    if (!sensor) {
      throw new NotFoundException(`Sensor with UUID ${uuid} not found`);
    }

    return sensor;
  }

  async findByCode(code: string): Promise<Sensor> {
    const sensor = await this.sensorRepository.findOne({
      where: { code },
      relations: ['user', 'location', 'events'],
    });

    if (!sensor) {
      throw new NotFoundException(`Sensor with code ${code} not found`);
    }

    return sensor;
  }

  async update(uuid: string, updateSensorDto: UpdateSensorDto): Promise<Sensor> {
    const sensor = await this.findOne(uuid);

    if ('code' in updateSensorDto && updateSensorDto.code && updateSensorDto.code !== sensor.code) {
      const existingSensor = await this.sensorRepository.findOne({
        where: { code: updateSensorDto.code },
      });

      if (existingSensor) {
        throw new ConflictException('Sensor with this code already exists');
      }
    }

    Object.assign(sensor, updateSensorDto);
    return await this.sensorRepository.save(sensor);
  }

  async remove(uuid: string): Promise<void> {
    const sensor = await this.findOne(uuid);
    await this.sensorRepository.remove(sensor);
  }

  async incrementEvents(uuid: string): Promise<Sensor> {
    const sensor = await this.findOne(uuid);
    sensor.total_events += 1;
    return await this.sensorRepository.save(sensor);
  }

  async incrementShutdowns(uuid: string): Promise<Sensor> {
    const sensor = await this.findOne(uuid);
    sensor.total_shutdown += 1;
    sensor.last_shutdown = new Date();
    return await this.sensorRepository.save(sensor);
  }

  async search(searchSensorDto: SearchSensorDto): Promise<Sensor[]> {
    const queryBuilder = this.sensorRepository.createQueryBuilder('sensor')
      .leftJoinAndSelect('sensor.user', 'user')
      .leftJoinAndSelect('sensor.location', 'location')
      .leftJoinAndSelect('sensor.events', 'events');

    if (searchSensorDto.code) {
      queryBuilder.andWhere('sensor.code ILIKE :code', { 
        code: `%${searchSensorDto.code}%` 
      });
    }

    if (searchSensorDto.equip_address_uuid) {
      queryBuilder.andWhere('sensor.equip_address_uuid = :equipAddressUuid', { 
        equipAddressUuid: searchSensorDto.equip_address_uuid 
      });
    }

    if (searchSensorDto.min_total_events !== undefined) {
      queryBuilder.andWhere('sensor.total_events >= :minTotalEvents', { 
        minTotalEvents: searchSensorDto.min_total_events 
      });
    }

    if (searchSensorDto.max_total_events !== undefined) {
      queryBuilder.andWhere('sensor.total_events <= :maxTotalEvents', { 
        maxTotalEvents: searchSensorDto.max_total_events 
      });
    }

    if (searchSensorDto.min_angle !== undefined) {
      queryBuilder.andWhere('sensor.angle >= :minAngle', { 
        minAngle: searchSensorDto.min_angle 
      });
    }

    if (searchSensorDto.max_angle !== undefined) {
      queryBuilder.andWhere('sensor.angle <= :maxAngle', { 
        maxAngle: searchSensorDto.max_angle 
      });
    }

    if (searchSensorDto.min_power_generate !== undefined) {
      queryBuilder.andWhere('sensor.power_generate >= :minPowerGenerate', { 
        minPowerGenerate: searchSensorDto.min_power_generate 
      });
    }

    if (searchSensorDto.max_power_generate !== undefined) {
      queryBuilder.andWhere('sensor.power_generate <= :maxPowerGenerate', { 
        maxPowerGenerate: searchSensorDto.max_power_generate 
      });
    }

    if (searchSensorDto.search) {
      queryBuilder.andWhere('sensor.code ILIKE :search', { 
        search: `%${searchSensorDto.search}%` 
      });
    }

    return await queryBuilder
      .orderBy('sensor.created_at', 'DESC')
      .getMany();
  }
}