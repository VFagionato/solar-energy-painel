import { Injectable } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { UpdateUserDto } from '../../users/dto/update-user.dto';
import { SearchUserDto } from '../../users/dto/search-user.dto';
import { IUserRepository } from '../interfaces/user-repository.interface';

/**
 * Mock implementation of the User Repository
 * 
 * This class provides an in-memory implementation of the IUserRepository interface
 * for testing purposes. It's useful for unit tests and development scenarios
 * where you don't want to depend on a real database.
 */
@Injectable()
export class MockUserRepository implements IUserRepository {
  private users: User[] = [];
  private nextId = 1;

  async create(userData: CreateUserDto): Promise<User> {
    const user: User = {
      uuid: `mock-uuid-${this.nextId++}`,
      name: userData.name,
      last_name: userData.last_name,
      document: userData.document,
      address_uuid: userData.address_uuid,
      created_at: new Date(),
      updated_at: new Date(),
      address: undefined,
      sensors: [],
    };

    this.users.push(user);
    return user;
  }

  async findAll(): Promise<User[]> {
    return [...this.users];
  }

  async findById(uuid: string): Promise<User | null> {
    return this.users.find(user => user.uuid === uuid) || null;
  }

  async findByDocument(document: string): Promise<User | null> {
    return this.users.find(user => user.document === document) || null;
  }

  async update(uuid: string, updateData: UpdateUserDto): Promise<User> {
    const userIndex = this.users.findIndex(user => user.uuid === uuid);
    if (userIndex === -1) {
      throw new Error(`User with UUID ${uuid} not found`);
    }

    const updatedUser = {
      ...this.users[userIndex],
      ...updateData,
      updated_at: new Date(),
    };

    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  async delete(uuid: string): Promise<void> {
    const userIndex = this.users.findIndex(user => user.uuid === uuid);
    if (userIndex === -1) {
      throw new Error(`User with UUID ${uuid} not found`);
    }

    this.users.splice(userIndex, 1);
  }

  async search(searchCriteria: SearchUserDto): Promise<User[]> {
    return this.users.filter(user => {
      if (searchCriteria.name && !user.name.toLowerCase().includes(searchCriteria.name.toLowerCase())) {
        return false;
      }
      if (searchCriteria.last_name && !user.last_name.toLowerCase().includes(searchCriteria.last_name.toLowerCase())) {
        return false;
      }
      if (searchCriteria.document && !user.document.includes(searchCriteria.document)) {
        return false;
      }
      if (searchCriteria.address_uuid && user.address_uuid !== searchCriteria.address_uuid) {
        return false;
      }
      if (searchCriteria.search) {
        const searchTerm = searchCriteria.search.toLowerCase();
        return user.name.toLowerCase().includes(searchTerm) ||
               user.last_name.toLowerCase().includes(searchTerm) ||
               user.document.includes(searchTerm);
      }
      return true;
    });
  }

  async findWithRelations(uuid: string, relations: string[]): Promise<User | null> {
    // For mock implementation, just return the user without loading relations
    return this.findById(uuid);
  }

  async exists(uuid: string): Promise<boolean> {
    return this.users.some(user => user.uuid === uuid);
  }

  async count(): Promise<number> {
    return this.users.length;
  }

  async findWithPagination(skip: number, take: number): Promise<{ users: User[]; total: number }> {
    const total = this.users.length;
    const users = this.users.slice(skip, skip + take);
    return { users, total };
  }

  // Utility methods for testing
  clear(): void {
    this.users = [];
    this.nextId = 1;
  }

  seed(users: Partial<User>[]): void {
    this.users = users.map((userData, index) => ({
      uuid: userData.uuid || `mock-uuid-${this.nextId++}`,
      name: userData.name || `User ${index + 1}`,
      last_name: userData.last_name || `LastName ${index + 1}`,
      document: userData.document || `DOC-${index + 1}`,
      address_uuid: userData.address_uuid,
      created_at: userData.created_at || new Date(),
      updated_at: userData.updated_at || new Date(),
      address: undefined,
      sensors: [],
    }));
  }
}