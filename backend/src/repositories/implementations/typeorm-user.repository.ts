import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { UpdateUserDto } from '../../users/dto/update-user.dto';
import { SearchUserDto } from '../../users/dto/search-user.dto';
import { IUserRepository } from '../interfaces/user-repository.interface';

/**
 * TypeORM implementation of the User Repository
 * 
 * This class implements the IUserRepository interface using TypeORM
 * for PostgreSQL database operations. It encapsulates all database-specific
 * logic and provides a clean interface for the UserService.
 */
@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  /**
   * Create a new user
   */
  async create(userData: CreateUserDto): Promise<User> {
    const user = this.repository.create(userData);
    return await this.repository.save(user);
  }

  /**
   * Find all users with their relations
   */
  async findAll(): Promise<User[]> {
    return await this.repository.find({
      relations: ['address', 'sensors'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Find a user by UUID
   */
  async findById(uuid: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { uuid },
      relations: ['address', 'sensors'],
    });
  }

  /**
   * Find a user by document number
   */
  async findByDocument(document: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { document },
    });
  }

  /**
   * Update a user by UUID
   */
  async update(uuid: string, updateData: UpdateUserDto): Promise<User> {
    const user = await this.findById(uuid);
    
    if (!user) {
      throw new NotFoundException(`User with UUID ${uuid} not found`);
    }

    Object.assign(user, updateData);
    return await this.repository.save(user);
  }

  /**
   * Delete a user by UUID
   */
  async delete(uuid: string): Promise<void> {
    const user = await this.findById(uuid);
    
    if (!user) {
      throw new NotFoundException(`User with UUID ${uuid} not found`);
    }

    await this.repository.remove(user);
  }

  /**
   * Search users based on criteria
   */
  async search(searchCriteria: SearchUserDto): Promise<User[]> {
    const queryBuilder = this.repository.createQueryBuilder('user')
      .leftJoinAndSelect('user.address', 'address')
      .leftJoinAndSelect('user.sensors', 'sensors');

    if (searchCriteria.name) {
      queryBuilder.andWhere('user.name ILIKE :name', { 
        name: `%${searchCriteria.name}%` 
      });
    }

    if (searchCriteria.last_name) {
      queryBuilder.andWhere('user.last_name ILIKE :lastName', { 
        lastName: `%${searchCriteria.last_name}%` 
      });
    }

    if (searchCriteria.document) {
      queryBuilder.andWhere('user.document ILIKE :document', { 
        document: `%${searchCriteria.document}%` 
      });
    }

    if (searchCriteria.address_uuid) {
      queryBuilder.andWhere('user.address_uuid = :addressUuid', { 
        addressUuid: searchCriteria.address_uuid 
      });
    }

    if (searchCriteria.search) {
      queryBuilder.andWhere(
        '(user.name ILIKE :search OR user.last_name ILIKE :search OR user.document ILIKE :search)',
        { search: `%${searchCriteria.search}%` }
      );
    }

    return await queryBuilder
      .orderBy('user.created_at', 'DESC')
      .getMany();
  }

  /**
   * Find a user with specific relations loaded
   */
  async findWithRelations(uuid: string, relations: string[]): Promise<User | null> {
    return await this.repository.findOne({
      where: { uuid },
      relations,
    });
  }

  /**
   * Check if a user exists by UUID
   */
  async exists(uuid: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { uuid },
    });
    return count > 0;
  }

  /**
   * Get total count of users
   */
  async count(): Promise<number> {
    return await this.repository.count();
  }

  /**
   * Find users with pagination
   */
  async findWithPagination(skip: number, take: number): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.repository.findAndCount({
      relations: ['address', 'sensors'],
      order: { created_at: 'DESC' },
      skip,
      take,
    });

    return { users, total };
  }
}