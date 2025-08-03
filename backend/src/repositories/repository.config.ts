import { Provider } from '@nestjs/common';
import { TypeOrmUserRepository } from './implementations/typeorm-user.repository';
import { MockUserRepository } from './implementations/mock-user.repository';

/**
 * Repository Configuration
 * 
 * This configuration allows easy switching between different repository implementations
 * based on environment variables or application needs.
 */
export type RepositoryType = 'typeorm' | 'mock' | 'mongo';

export interface RepositoryConfig {
  type: RepositoryType;
  userRepository: Provider;
}

/**
 * Factory function to create repository configuration based on environment
 */
export function createRepositoryConfig(type?: RepositoryType): RepositoryConfig {
  const repositoryType = type || (process.env.REPOSITORY_TYPE as RepositoryType) || 'typeorm';

  switch (repositoryType) {
    case 'mock':
      return {
        type: 'mock',
        userRepository: {
          provide: 'USER_REPOSITORY',
          useClass: MockUserRepository,
        },
      };

    case 'typeorm':
    default:
      return {
        type: 'typeorm',
        userRepository: {
          provide: 'USER_REPOSITORY',
          useClass: TypeOrmUserRepository,
        },
      };

    // Example for future MongoDB implementation
    // case 'mongo':
    //   return {
    //     type: 'mongo',
    //     userRepository: {
    //       provide: 'USER_REPOSITORY',
    //       useClass: MongoUserRepository,
    //     },
    //   };
  }
}

/**
 * Get all repository providers based on configuration
 */
export function getRepositoryProviders(config?: RepositoryConfig): Provider[] {
  const repositoryConfig = config || createRepositoryConfig();
  
  return [
    repositoryConfig.userRepository,
    // Add other repository providers here as they are implemented
  ];
}