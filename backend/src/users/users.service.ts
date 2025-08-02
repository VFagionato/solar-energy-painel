import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUserDto } from './dto/search-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { document: createUserDto.document },
    });

    if (existingUser) {
      throw new ConflictException('User with this document already exists');
    }

    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      relations: ['address', 'sensors'],
    });
  }

  async findOne(uuid: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { uuid },
      relations: ['address', 'sensors'],
    });

    if (!user) {
      throw new NotFoundException(`User with UUID ${uuid} not found`);
    }

    return user;
  }

  async update(uuid: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(uuid);

    if (updateUserDto.document && updateUserDto.document !== user.document) {
      const existingUser = await this.userRepository.findOne({
        where: { document: updateUserDto.document },
      });

      if (existingUser) {
        throw new ConflictException('User with this document already exists');
      }
    }

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(uuid: string): Promise<void> {
    const user = await this.findOne(uuid);
    await this.userRepository.remove(user);
  }

  async search(searchUserDto: SearchUserDto): Promise<User[]> {
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.address', 'address')
      .leftJoinAndSelect('user.sensors', 'sensors');

    if (searchUserDto.name) {
      queryBuilder.andWhere('user.name ILIKE :name', { 
        name: `%${searchUserDto.name}%` 
      });
    }

    if (searchUserDto.last_name) {
      queryBuilder.andWhere('user.last_name ILIKE :lastName', { 
        lastName: `%${searchUserDto.last_name}%` 
      });
    }

    if (searchUserDto.document) {
      queryBuilder.andWhere('user.document ILIKE :document', { 
        document: `%${searchUserDto.document}%` 
      });
    }

    if (searchUserDto.address_uuid) {
      queryBuilder.andWhere('user.address_uuid = :addressUuid', { 
        addressUuid: searchUserDto.address_uuid 
      });
    }

    if (searchUserDto.search) {
      queryBuilder.andWhere(
        '(user.name ILIKE :search OR user.last_name ILIKE :search OR user.document ILIKE :search)',
        { search: `%${searchUserDto.search}%` }
      );
    }

    return await queryBuilder
      .orderBy('user.created_at', 'DESC')
      .getMany();
  }
}