import { User } from '../../entities/user.entity';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { UpdateUserDto } from '../../users/dto/update-user.dto';
import { SearchUserDto } from '../../users/dto/search-user.dto';

/**
 * User Repository Interface
 * 
 * Defines the contract for user data access operations.
 * This interface abstracts the underlying database implementation,
 * allowing for easy switching between different database technologies.
 */
export interface IUserRepository {
  /**
   * Create a new user
   * @param userData User creation data
   * @returns Promise resolving to the created user
   */
  create(userData: CreateUserDto): Promise<User>;

  /**
   * Find all users with their relations
   * @returns Promise resolving to array of users
   */
  findAll(): Promise<User[]>;

  /**
   * Find a user by UUID
   * @param uuid User unique identifier
   * @returns Promise resolving to user or null if not found
   */
  findById(uuid: string): Promise<User | null>;

  /**
   * Find a user by document number
   * @param document User document number
   * @returns Promise resolving to user or null if not found
   */
  findByDocument(document: string): Promise<User | null>;

  /**
   * Update a user by UUID
   * @param uuid User unique identifier
   * @param updateData User update data
   * @returns Promise resolving to updated user
   */
  update(uuid: string, updateData: UpdateUserDto): Promise<User>;

  /**
   * Delete a user by UUID
   * @param uuid User unique identifier
   * @returns Promise resolving when deletion is complete
   */
  delete(uuid: string): Promise<void>;

  /**
   * Search users based on criteria
   * @param searchCriteria Search parameters
   * @returns Promise resolving to array of matching users
   */
  search(searchCriteria: SearchUserDto): Promise<User[]>;

  /**
   * Find a user with specific relations loaded
   * @param uuid User unique identifier
   * @param relations Array of relation names to load
   * @returns Promise resolving to user with relations or null
   */
  findWithRelations(uuid: string, relations: string[]): Promise<User | null>;

  /**
   * Check if a user exists by UUID
   * @param uuid User unique identifier
   * @returns Promise resolving to boolean indicating existence
   */
  exists(uuid: string): Promise<boolean>;

  /**
   * Get total count of users
   * @returns Promise resolving to number of users
   */
  count(): Promise<number>;

  /**
   * Find users with pagination
   * @param skip Number of records to skip
   * @param take Number of records to take
   * @returns Promise resolving to array of users and total count
   */
  findWithPagination(skip: number, take: number): Promise<{ users: User[]; total: number }>;
}