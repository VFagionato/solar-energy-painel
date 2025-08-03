# Repository Pattern Implementation

This directory implements the Repository Pattern to provide a database-agnostic layer for data access operations. The pattern follows the **Dependency Inversion Principle** from SOLID principles.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   UserService   │───▶│ IUserRepository  │◀───│ TypeOrmUserRepo     │
│  (Business)     │    │   (Interface)    │    │ (Implementation)    │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
                                │
                                ▼
                       ┌─────────────────────┐
                       │ MockUserRepo        │
                       │ (Test/Dev Impl)     │
                       └─────────────────────┘
```

## 📁 Directory Structure

```
repositories/
├── interfaces/                    # Repository interfaces (contracts)
│   └── user-repository.interface.ts
├── implementations/               # Concrete implementations
│   ├── typeorm-user.repository.ts # TypeORM/PostgreSQL implementation
│   └── mock-user.repository.ts    # In-memory implementation for testing
├── repositories.module.ts         # NestJS module configuration
├── repository.config.ts          # Configuration for switching implementations
├── index.ts                      # Barrel exports
└── README.md                     # This file
```

## 🚀 Benefits

### 1. **Database Independence**
- Easy to switch from PostgreSQL to MongoDB, MySQL, etc.
- Business logic doesn't depend on specific database technology
- Future-proof against database migrations

### 2. **Improved Testing**
```typescript
// Easy unit testing with mock repositories
const mockRepository: IUserRepository = {
  findById: jest.fn().mockResolvedValue(mockUser),
  create: jest.fn().mockResolvedValue(mockUser),
  // ...
};
```

### 3. **Clean Architecture Compliance**
- **Business Logic** (UserService) is independent of **Infrastructure** (Database)
- **Dependency Inversion**: High-level modules don't depend on low-level modules
- **Single Responsibility**: Each layer has a clear, focused purpose

### 4. **Flexibility & Maintainability**
- Add new database implementations without changing business logic
- Easy to optimize database-specific operations
- Clear separation of concerns

## 🔧 Usage Examples

### Switching Repository Implementations

#### Environment Variable Approach
```bash
# Use TypeORM (default)
REPOSITORY_TYPE=typeorm npm run start

# Use Mock for testing
REPOSITORY_TYPE=mock npm run start
```

#### Programmatic Configuration
```typescript
// For testing
const testModule = await Test.createTestingModule({
  imports: [RepositoriesModule],
  providers: [
    {
      provide: 'USER_REPOSITORY',
      useClass: MockUserRepository,
    },
  ],
}).compile();
```

### Adding New Database Implementation

1. **Create Interface Implementation**:
```typescript
// mongo-user.repository.ts
@Injectable()
export class MongoUserRepository implements IUserRepository {
  constructor(
    @InjectModel('User') 
    private readonly userModel: Model<User>,
  ) {}

  async create(userData: CreateUserDto): Promise<User> {
    const user = new this.userModel(userData);
    return await user.save();
  }
  // ... implement other methods
}
```

2. **Update Configuration**:
```typescript
// repository.config.ts
case 'mongo':
  return {
    type: 'mongo',
    userRepository: {
      provide: 'USER_REPOSITORY',
      useClass: MongoUserRepository,
    },
  };
```

3. **No changes needed in UserService!** 🎉

## 📋 Repository Interface

The `IUserRepository` interface defines the contract for all user data operations:

- `create(userData)` - Create new user
- `findAll()` - Get all users with relations
- `findById(uuid)` - Find user by ID
- `findByDocument(document)` - Find user by document
- `update(uuid, data)` - Update user
- `delete(uuid)` - Delete user
- `search(criteria)` - Search users with filters
- `findWithRelations(uuid, relations)` - Load specific relations
- `exists(uuid)` - Check if user exists
- `count()` - Get total user count
- `findWithPagination(skip, take)` - Paginated results

## 🧪 Testing Strategies

### Unit Testing with Mocks
```typescript
describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByDocument: jest.fn(),
      // ... other methods
    };

    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: 'USER_REPOSITORY', useValue: mockRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    mockRepository = module.get('USER_REPOSITORY');
  });

  it('should create a user', async () => {
    const userData = { name: 'John', last_name: 'Doe', document: '123' };
    const expectedUser = { uuid: '1', ...userData };
    
    mockRepository.findByDocument.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue(expectedUser);

    const result = await service.create(userData);
    
    expect(mockRepository.findByDocument).toHaveBeenCalledWith('123');
    expect(mockRepository.create).toHaveBeenCalledWith(userData);
    expect(result).toEqual(expectedUser);
  });
});
```

### Integration Testing with Real Database
```typescript
describe('UsersService Integration', () => {
  let app: INestApplication;
  let userService: UsersService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          // Test database configuration
          type: 'postgres',
          database: 'test_solarwinds',
          // ...
        }),
        UsersModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    userService = module.get<UsersService>(UsersService);
  });

  it('should persist user to database', async () => {
    const userData = { name: 'Jane', last_name: 'Smith', document: '456' };
    
    const createdUser = await userService.create(userData);
    const foundUser = await userService.findOne(createdUser.uuid);
    
    expect(foundUser).toEqual(createdUser);
  });
});
```

## 🔄 Migration Guide

If you're migrating existing services to use this pattern:

1. **Create Interface**: Define the repository interface
2. **Implement Repository**: Move data access logic from service to repository
3. **Update Service**: Inject interface instead of TypeORM repository
4. **Configure DI**: Set up dependency injection in module
5. **Update Tests**: Use mock repositories for unit tests

## 🎯 Best Practices

1. **Keep Interfaces Simple**: Don't expose database-specific features
2. **Use DTOs**: Define clear data transfer objects for operations
3. **Handle Errors Consistently**: Let repositories throw meaningful exceptions
4. **Document Behavior**: Use JSDoc to document interface methods
5. **Test Thoroughly**: Ensure all implementations work correctly
6. **Performance Considerations**: Profile and optimize as needed

## 🔮 Future Enhancements

- **Caching Layer**: Add Redis caching to repository implementations
- **Event Sourcing**: Implement event-driven repository for audit trails
- **Read/Write Separation**: Separate interfaces for CQRS pattern
- **Generic Repository**: Create base repository interface for common operations
- **Validation**: Add data validation at repository level
- **Metrics**: Add performance monitoring and metrics collection

## 📚 References

- [Repository Pattern by Martin Fowler](https://martinfowler.com/eaaCatalog/repository.html)
- [Clean Architecture by Robert Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [NestJS Custom Providers](https://docs.nestjs.com/fundamentals/custom-providers)