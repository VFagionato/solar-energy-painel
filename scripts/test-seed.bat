@echo off
echo Testing Solar Winds Database Seeding
echo.

REM Check if PostgreSQL container is running
docker ps | findstr solarwinds-postgres >nul
if %errorlevel% neq 0 (
    echo PostgreSQL container is not running
    echo Starting PostgreSQL...
    docker-compose up -d postgres
    timeout /t 10 /nobreak >nul
)

echo Checking database connection...
docker exec solarwinds-postgres pg_isready -U admin -d solarwinds >nul
if %errorlevel% neq 0 (
    echo Database is not ready. Please check PostgreSQL status.
    pause
    exit /b 1
)

echo Database is ready!
echo.
echo Running seeding script...

REM Run the seeding SQL script
docker exec -i solarwinds-postgres psql -U admin -d solarwinds < scripts\seed-database.sql

if %errorlevel% equ 0 (
    echo.
    echo Seeding completed! Checking results...
    echo.
    
    echo Users created:
    docker exec solarwinds-postgres psql -U admin -d solarwinds -c "SELECT COUNT(*) as user_count FROM users;"
    
    echo.
    echo Addresses created:
    docker exec solarwinds-postgres psql -U admin -d solarwinds -c "SELECT COUNT(*) as address_count FROM addresses;"
    
    echo.
    echo Sensors created:
    docker exec solarwinds-postgres psql -U admin -d solarwinds -c "SELECT code, power_generate, total_events FROM sensors ORDER BY code;"
    
    echo.
    echo Events created:
    docker exec solarwinds-postgres psql -U admin -d solarwinds -c "SELECT COUNT(*) as event_count FROM events;"
    
    echo.
    echo Recent events sample:
    docker exec solarwinds-postgres psql -U admin -d solarwinds -c "SELECT s.code, e.power_generated, e.heat, e.timestamp FROM events e JOIN sensors s ON e.sensor_uuid = s.uuid ORDER BY e.timestamp DESC LIMIT 5;"
    
) else (
    echo.
    echo Error occurred during seeding
)

echo.
pause