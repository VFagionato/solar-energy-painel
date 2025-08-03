@echo off
echo 🌞 Solar Winds Database Seeding Script
echo.

REM Check if PostgreSQL container is running
docker ps | findstr solarwinds-postgres >nul
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL container is not running
    echo Starting PostgreSQL...
    docker-compose up -d postgres
    echo ⏳ Waiting for database to be ready...
    timeout /t 10 /nobreak >nul
)

echo 🔄 Checking database connection...
docker exec solarwinds-postgres pg_isready -U admin -d solarwinds >nul
if %errorlevel% neq 0 (
    echo ❌ Database is not ready. Please check PostgreSQL status.
    pause
    exit /b 1
)

echo ✅ Database is ready!
echo.

echo 🗑️  Warning: This will DELETE all existing data!
set /p confirm="Continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo ❌ Seeding cancelled
    pause
    exit /b 0
)

echo.
echo 🌱 Seeding database with sample solar energy data...
echo This may take a few minutes...

REM Run the seeding SQL script
docker exec -i solarwinds-postgres psql -U admin -d solarwinds < scripts\seed-database.sql

if %errorlevel% equ 0 (
    echo.
    echo ✅ Database seeded successfully!
    echo.
    echo 📊 Your solar energy monitoring system now has:
    echo    👥 5 Sample users with real addresses
    echo    🏠 10 Different locations (homes and solar farms)
    echo    🔌 10 Solar sensors with realistic configurations
    echo    ⚡ 1000+ Energy generation events over 30 days
    echo.
    echo 🎉 Ready to explore the dashboard!
    echo 🌐 Frontend: http://localhost:5173
    echo 🔧 Backend: http://localhost:8001
    echo.
) else (
    echo.
    echo ❌ Error occurred during seeding
    echo Check the error messages above
)

pause