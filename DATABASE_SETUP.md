# Solar Winds Database Setup Guide

## Overview
This project uses PostgreSQL 15 running in Docker containers for the solar energy monitoring system. The database is fully configured with all necessary tables, relationships, and custom functions.

## Quick Start

### Windows Users
```bash
# Start database
db-manage.bat start

# Check status
db-manage.bat status

# Connect to database
db-manage.bat connect

# Start backend
cd backend
npm run start:dev
```

### Linux/Mac Users
```bash
# Start database
./db-manage.sh start

# Check status
./db-manage.sh status

# Connect to database
./db-manage.sh connect

# Start backend
cd backend
npm run start:dev
```

## Database Configuration

### Connection Details
- **Host**: localhost
- **Port**: 5432
- **Database**: solarwinds
- **Username**: admin
- **Password**: password
- **Backend Port**: 8001

### Environment Variables
The backend uses these environment variables (configured in `backend/.env`):
```env
DATABASE_URL=postgresql://admin:password@localhost:5432/solarwinds
DB_HOST=localhost
DB_PORT=5432
DB_NAME=solarwinds
DB_USERNAME=admin
DB_PASSWORD=password
```

## Database Schema

### Tables Created
- **users** - Solar energy system users
- **addresses** - Physical addresses for users and sensors
- **sensors** - Solar panel sensors and equipment
- **events** - Energy generation events from sensors
- **health_check** - System health monitoring

### Relationships
- Users ↔ Address (1:1)
- Users → Sensors (1:N)
- Address → Sensors (1:N)
- Sensors → Events (1:N)

### Custom Functions
- `calculate_efficiency(power_generated, max_capacity)` - Calculate panel efficiency
- `get_daily_energy_summary(sensor_id, target_date)` - Get daily energy statistics

## Management Commands

### Database Management Script
The `db-manage.sh` (Linux/Mac) or `db-manage.bat` (Windows) script provides easy database operations:

```bash
# Start/Stop Database
./db-manage.sh start      # Start PostgreSQL
./db-manage.sh stop       # Stop PostgreSQL
./db-manage.sh restart    # Restart PostgreSQL

# Monitoring
./db-manage.sh status     # Show status
./db-manage.sh logs       # Show logs
./db-manage.sh health     # Health check

# Database Access
./db-manage.sh connect    # Connect with psql
./db-manage.sh pgadmin    # Start PgAdmin web interface

# Backup/Restore
./db-manage.sh backup     # Create backup
./db-manage.sh restore    # List backups for restore

# Dangerous Operations
./db-manage.sh reset      # Reset database (deletes all data)
```

### Backup Operations
```bash
# Create backup
./db-backup.sh [backup_name]

# Restore backup
./db-restore.sh <backup_filename>
```

## Docker Services

### PostgreSQL Container
- **Image**: postgres:15-alpine
- **Container**: solarwinds-postgres
- **Network**: solarwinds-network
- **Volumes**: 
  - `postgres_data` (persistent data)
  - `./init-scripts` (initialization scripts)
  - `./backups` (backup storage)

### PgAdmin (Optional)
- **Access**: http://localhost:5050
- **Email**: admin@solarwinds.com
- **Password**: admin123
- **Profile**: development only

Start with: `docker-compose --profile dev up -d pgadmin`

## Development Workflow

### 1. Start Database
```bash
docker-compose up -d postgres
```

### 2. Verify Connection
```bash
docker exec solarwinds-postgres pg_isready -U admin -d solarwinds
```

### 3. Start Backend
```bash
cd backend
npm run start:dev
```

### 4. Start Frontend
```bash
cd frontend
npm run dev
```

## Database Features

### Extensions Installed
- `uuid-ossp` - UUID generation functions
- `pgcrypto` - Cryptographic functions

### Timezone Configuration
- Set to UTC for consistent timestamp handling

### Performance Features
- Proper indexes on foreign keys
- Connection pooling configured
- Health check monitoring
- Log rotation enabled

## Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check Docker status
docker ps -a

# Check logs
docker-compose logs postgres

# Reset if needed
docker-compose down
docker volume rm solar-winds_postgres_data
docker-compose up -d postgres
```

#### Connection Refused
```bash
# Check if container is running
docker ps | grep solarwinds-postgres

# Check if database is ready
docker exec solarwinds-postgres pg_isready -U admin -d solarwinds

# Restart if needed
docker-compose restart postgres
```

#### Backend Can't Connect
1. Verify PostgreSQL is running: `./db-manage.sh status`
2. Check environment variables in `backend/.env`
3. Ensure port 5432 is not blocked
4. Check TypeORM configuration in `backend/src/app.module.ts`

#### Data Loss Prevention
- Regular backups: `./db-backup.sh`
- Don't use `synchronize: true` in production
- Use migrations for schema changes

## Production Considerations

### Security
- Change default passwords
- Use environment variables for secrets
- Enable SSL/TLS connections
- Restrict network access
- Regular security updates

### Performance
- Configure connection pooling
- Monitor query performance
- Set up proper indexes
- Use read replicas if needed

### Monitoring
- Set up health checks
- Monitor disk space
- Log analysis
- Performance metrics

### Backup Strategy
- Automated daily backups
- Off-site backup storage
- Backup validation
- Recovery testing

## API Endpoints

With the database running, these endpoints are available:

### Health Check
- `GET /health` - Application health status

### Users
- `GET /users` - List all users
- `POST /users` - Create user
- `GET /users/:uuid` - Get user details
- `PATCH /users/:uuid` - Update user
- `DELETE /users/:uuid` - Delete user
- `POST /users/search` - Search users

### Addresses
- `GET /addresses` - List all addresses
- `POST /addresses` - Create address
- `GET /addresses/:uuid` - Get address details
- `PATCH /addresses/:uuid` - Update address
- `DELETE /addresses/:uuid` - Delete address
- `POST /addresses/search` - Search addresses

### Sensors
- `GET /sensors` - List all sensors
- `POST /sensors` - Create sensor
- `GET /sensors/:uuid` - Get sensor details
- `GET /sensors/code/:code` - Get sensor by code
- `PATCH /sensors/:uuid` - Update sensor
- `DELETE /sensors/:uuid` - Delete sensor
- `POST /sensors/:uuid/increment-events` - Increment event count
- `POST /sensors/:uuid/increment-shutdowns` - Increment shutdown count
- `POST /sensors/search` - Search sensors

### Events
- `GET /events` - List all events
- `POST /events` - Create event
- `GET /events/:uuid` - Get event details
- `GET /events/sensor/:sensorUuid` - Get events by sensor
- `GET /events/sensor/:sensorUuid/stats` - Get sensor statistics
- `PATCH /events/:uuid` - Update event
- `DELETE /events/:uuid` - Delete event
- `POST /events/search` - Search events

## Success Indicators

✅ PostgreSQL container running and healthy  
✅ Database `solarwinds` created with all tables  
✅ Custom functions installed  
✅ Backend connects successfully  
✅ TypeORM synchronization completed  
✅ All API endpoints mapped  
✅ Health check table populated  
✅ Management scripts working  

Your solar energy monitoring database is ready for development! 🌞