import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Address } from '../entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { SearchAddressDto } from './dto/search-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    this.validateUserOrSensorUuid(createAddressDto);

    const address = this.addressRepository.create(createAddressDto);
    return await this.addressRepository.save(address);
  }

  async findAll(): Promise<Address[]> {
    return await this.addressRepository.find({
      relations: ['user', 'sensors'],
    });
  }

  async findOne(uuid: string): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { uuid },
      relations: ['user', 'sensors'],
    });

    if (!address) {
      throw new NotFoundException(`Address with UUID ${uuid} not found`);
    }

    return address;
  }

  async update(uuid: string, updateAddressDto: UpdateAddressDto): Promise<Address> {
    const address = await this.findOne(uuid);

    if (updateAddressDto.user_uuid !== undefined || updateAddressDto.sensor_uuid !== undefined) {
      const updatedData = { ...address, ...updateAddressDto };
      this.validateUserOrSensorUuid(updatedData);
    }

    Object.assign(address, updateAddressDto);
    return await this.addressRepository.save(address);
  }

  async remove(uuid: string): Promise<void> {
    const address = await this.findOne(uuid);
    await this.addressRepository.remove(address);
  }

  async search(searchAddressDto: SearchAddressDto): Promise<Address[]> {
    const queryBuilder = this.addressRepository.createQueryBuilder('address')
      .leftJoinAndSelect('address.user', 'user')
      .leftJoinAndSelect('address.sensors', 'sensors');

    if (searchAddressDto.user_uuid) {
      queryBuilder.andWhere('address.user_uuid = :userUuid', { 
        userUuid: searchAddressDto.user_uuid 
      });
    }

    if (searchAddressDto.sensor_uuid) {
      queryBuilder.andWhere('address.sensor_uuid = :sensorUuid', { 
        sensorUuid: searchAddressDto.sensor_uuid 
      });
    }

    if (searchAddressDto.street) {
      queryBuilder.andWhere('address.street ILIKE :street', { 
        street: `%${searchAddressDto.street}%` 
      });
    }

    if (searchAddressDto.city) {
      queryBuilder.andWhere('address.city ILIKE :city', { 
        city: `%${searchAddressDto.city}%` 
      });
    }

    if (searchAddressDto.state) {
      queryBuilder.andWhere('address.state ILIKE :state', { 
        state: `%${searchAddressDto.state}%` 
      });
    }

    if (searchAddressDto.zipcode) {
      queryBuilder.andWhere('address.zipcode ILIKE :zipcode', { 
        zipcode: `%${searchAddressDto.zipcode}%` 
      });
    }

    if (searchAddressDto.country) {
      queryBuilder.andWhere('address.country ILIKE :country', { 
        country: `%${searchAddressDto.country}%` 
      });
    }

    if (searchAddressDto.search) {
      queryBuilder.andWhere(
        '(address.street ILIKE :search OR address.city ILIKE :search OR address.state ILIKE :search OR address.country ILIKE :search)',
        { search: `%${searchAddressDto.search}%` }
      );
    }

    return await queryBuilder
      .orderBy('address.created_at', 'DESC')
      .getMany();
  }

  private validateUserOrSensorUuid(addressData: Partial<CreateAddressDto | UpdateAddressDto>): void {
    const hasUserUuid = addressData.user_uuid != null && addressData.user_uuid.trim() !== '';
    const hasSensorUuid = addressData.sensor_uuid != null && addressData.sensor_uuid.trim() !== '';

    if (!hasUserUuid && !hasSensorUuid) {
      throw new BadRequestException('Address must have either user_uuid or sensor_uuid');
    }

    if (hasUserUuid && hasSensorUuid) {
      throw new BadRequestException('Address cannot have both user_uuid and sensor_uuid');
    }
  }
}