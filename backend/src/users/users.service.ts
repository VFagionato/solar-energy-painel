import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { IUserRepository } from '../repositories/interfaces/user-repository.interface';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: IUserRepository,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByDocument(createUserDto.document);

    if (existingUser) {
      throw new ConflictException('User with this document already exists');
    }

    return await this.userRepository.create(createUserDto);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async findOne(uuid: string): Promise<User> {
    const user = await this.userRepository.findById(uuid);

    if (!user) {
      throw new NotFoundException(`User with UUID ${uuid} not found`);
    }

    return user;
  }

  async update(uuid: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findById(uuid);

    if (!user) {
      throw new NotFoundException(`User with UUID ${uuid} not found`);
    }

    if ('document' in updateUserDto && updateUserDto.document && updateUserDto.document !== user.document) {
      const existingUser = await this.userRepository.findByDocument(updateUserDto.document);

      if (existingUser) {
        throw new ConflictException('User with this document already exists');
      }
    }

    return await this.userRepository.update(uuid, updateUserDto);
  }

  async remove(uuid: string): Promise<void> {
    await this.userRepository.delete(uuid);
  }

  async search(searchUserDto: SearchUserDto): Promise<User[]> {
    return await this.userRepository.search(searchUserDto);
  }
}