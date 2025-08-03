@echo off
echo Solar Winds Development Environment (Simple Version)
echo.

REM Start PostgreSQL
echo Starting PostgreSQL database...
docker-compose up -d postgres
if %errorlevel% neq 0 (
    echo Error starting PostgreSQL. Make sure Docker Desktop is running.
    pause
    exit /b 1
)

echo Waiting for database to be ready...
timeout /t 10 /nobreak >nul

REM Ask about seeding
echo.
set /p seed="Populate database with sample data? (y/N): "
if /i "%seed%"=="y" (
    echo Seeding database...
    docker exec -i solarwinds-postgres psql -U admin -d solarwinds < scripts\seed-database.sql
    echo Seeding completed.
)

echo.
echo Starting backend...
cd backend
if not exist "node_modules" npm install >nul
start "Backend" cmd /c "npm run start:dev && pause"
cd ..

echo Starting frontend...
cd frontend
if not exist "node_modules" npm install >nul
start "Frontend" cmd /c "npm run dev && pause"
cd ..

echo.
echo Development environment started!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:8001
echo.
pause