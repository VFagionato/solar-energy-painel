# Solar Winds Database Seeding Guide

## Overview
The Solar Winds application includes comprehensive database seeding capabilities to populate your development environment with realistic solar energy monitoring data.

## 🚀 Quick Start

### Automatic Seeding (Recommended)
When you run `dev.bat` (Windows) or `./dev.sh` (Linux/Mac), the script will:
1. Start PostgreSQL database
2. Check if database has data
3. Automatically prompt you to seed if empty or has limited data
4. Start backend and frontend servers

```bash
# Windows
dev.bat

# Linux/Mac
./dev.sh
```

### Manual Seeding
You can also manually seed the database at any time:

```bash
# Windows
scripts\seed-data.bat

# Linux/Mac
./scripts/seed-data.sh
```

## 📊 Sample Data Generated

### 👥 Users (5 total)
- **João Silva** - Document: 123.456.789-01
- **Maria Santos** - Document: 234.567.890-12  
- **Pedro Oliveira** - Document: 345.678.901-23
- **Ana Costa** - Document: 456.789.012-34
- **Carlos Ferreira** - Document: 567.890.123-45

### 🏠 Addresses (10 total)
**User Addresses:**
- Rua das Flores, 123 - São Paulo, SP
- Avenida Paulista, 1000 - São Paulo, SP
- Rua Oscar Freire, 456 - São Paulo, SP
- Avenida Faria Lima, 2500 - São Paulo, SP
- Rua Augusta, 789 - São Paulo, SP

**Equipment/Solar Farm Addresses:**
- Estrada Rural Solar, KM 15 - Ribeirão Preto, SP
- Fazenda Energia Limpa, S/N - Campinas, SP
- Parque Solar Central, Lote 10 - Sorocaba, SP
- Campo Solar Norte, Área A - Santos, SP
- Usina Solar Sul, Setor 5 - São José dos Campos, SP

### 🔌 Solar Sensors (10 total)

**Solar Farm Sensors (Industrial):**
- **SOLAR-FARM-001** - 850.5kW capacity, 180° angle
- **SOLAR-FARM-002** - 920.0kW capacity, 165° angle
- **SOLAR-FARM-003** - 780.3kW capacity, 200° angle
- **SOLAR-FARM-004** - 1100.2kW capacity, 175° angle
- **SOLAR-FARM-005** - 650.8kW capacity, 190° angle

**Home Solar Sensors (Residential):**
- **SOLAR-HOME-001** - 250.5kW capacity, 45° angle
- **SOLAR-HOME-002** - 320.8kW capacity, 60° angle
- **SOLAR-HOME-003** - 180.2kW capacity, 30° angle

**Commercial Solar Panels:**
- **SOLAR-PANEL-A1** - 450.6kW capacity, 120° angle
- **SOLAR-PANEL-B2** - 520.9kW capacity, 135° angle

### ⚡ Energy Events (1000+ total)

**Realistic Generation Patterns:**
- **Time-based**: Solar generation follows realistic daily curves (6 AM - 6 PM)
- **Weather Variation**: Includes cloudy days (30-70% efficiency) and clear days (80-100% efficiency)
- **Seasonal Effects**: Random weather patterns affect daily generation
- **Peak Performance**: Some sensors have peak performance events
- **Low Performance**: Maintenance and cloudy day events

**Data Coverage:**
- **30 Days** of historical data
- **Events every 2 hours** during daylight hours
- **Realistic power curves** based on solar intensity
- **Heat correlation** with power generation
- **Special events** (maintenance, peak performance)

## 🎯 Dashboard Visualization Ready

After seeding, your dashboard will show:

### Overview Section
- ✅ 5 Active users
- ✅ 10 Solar sensors (farms + homes)
- ✅ 1000+ Energy events
- ✅ Real-time power statistics

### Analytics Section
- ✅ Power generation charts with 30 days of data
- ✅ Events aggregation by sensor and user
- ✅ Heat vs power correlation charts
- ✅ Performance trends and patterns

### Search & Management
- ✅ Search functionality with real data
- ✅ User management with actual profiles
- ✅ Sensor management with various types
- ✅ Advanced filtering capabilities

## 🛠️ Seeding Options

### SQL-based Seeding (Primary)
Location: `scripts/seed-database.sql`
- Uses native PostgreSQL functions
- Generates realistic data patterns
- Fast execution (< 30 seconds)
- Includes custom solar energy functions

### Node.js Seeding (Alternative)
Location: `backend/scripts/seed-database.js`
- Uses TypeORM entities
- More programmatic control
- Slower but more flexible
- Better for custom data scenarios

## 🔧 Customization

### Modify Sample Data
Edit these files to customize the generated data:

**Users & Addresses:**
```sql
-- In scripts/seed-database.sql, modify the VALUES sections:
VALUES 
    ('João', 'Silva', '123.456.789-01'),
    ('Your', 'Name', 'Your-Document'),
    -- Add more users...
```

**Sensor Configurations:**
```sql
-- Modify sensor specifications:
VALUES 
    ('YOUR-SENSOR-001', 156, 180.0, 850.5, 2),
    -- code, total_events, angle, power_generate, total_shutdown
```

**Time Range:**
```sql
-- Change the date range for events:
generate_series(
    NOW() - INTERVAL '60 days',  -- Change from 30 to 60 days
    NOW(),
    INTERVAL '1 hour'            -- Change from 2 hours to 1 hour
)
```

### Add Custom Functions
The seeding script includes custom PostgreSQL functions you can use:

```sql
-- Calculate panel efficiency
SELECT calculate_efficiency(current_power, max_capacity);

-- Get daily energy summary
SELECT * FROM get_daily_energy_summary('sensor-uuid', '2024-01-15');
```

## 🐛 Troubleshooting

### Seeding Fails
```bash
# Check database connection
docker exec solarwinds-postgres pg_isready -U admin -d solarwinds

# Check container status
docker ps | grep solarwinds-postgres

# Restart database
docker-compose restart postgres
```

### Partial Data
If seeding stopped midway:
```bash
# Clear partial data and retry
docker exec -i solarwinds-postgres psql -U admin -d solarwinds -c "
DELETE FROM events;
DELETE FROM sensors; 
DELETE FROM users;
DELETE FROM addresses;
"

# Re-run seeding
scripts/seed-data.bat  # or ./scripts/seed-data.sh
```

### Performance Issues
```bash
# Check database size
docker exec solarwinds-postgres psql -U admin -d solarwinds -c "
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public';
"

# Optimize if needed
docker exec solarwinds-postgres psql -U admin -d solarwinds -c "VACUUM ANALYZE;"
```

## 📈 Expected Results

After successful seeding, you should see:

### Database Tables
- **users**: 5 rows
- **addresses**: 10 rows  
- **sensors**: 10 rows
- **events**: 1000+ rows (varies by date range)

### Dashboard Metrics
- Total Power Capacity: ~5,000+ kW
- Active Sensors: 10
- Recent Events: Real-time data for past 30 days
- User Assignments: 3 users with home sensors

### API Endpoints
All endpoints will return realistic data:
- `GET /users` - 5 users with addresses
- `GET /sensors` - 10 sensors with location data
- `GET /events` - 1000+ energy generation events
- `POST /*/search` - Functional search with real results

## 🎉 Success Indicators

✅ Database seeding completes without errors  
✅ Dashboard shows realistic charts with data  
✅ Search functionality returns relevant results  
✅ User management shows actual profiles  
✅ Sensor management displays various sensor types  
✅ Events show realistic solar generation patterns  
✅ Backend API returns data for all endpoints  

Your solar energy monitoring system is now ready for development and demonstration! 🌞