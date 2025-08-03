@echo off
setlocal EnableDelayedExpansion
echo Solar Winds Development Environment
echo.

REM Create .env files if they don't exist
if not exist "backend\.env" if exist "backend\.env.example" copy "backend\.env.example" "backend\.env" >nul
if not exist "frontend\.env" if exist "frontend\.env.example" copy "frontend\.env.example" "frontend\.env" >nul

REM Try to start PostgreSQL
echo Starting PostgreSQL database...
docker-compose up -d postgres >nul 2>&1
if !errorlevel! equ 0 (
    echo PostgreSQL started successfully
    echo Waiting for database to be ready...
    timeout /t 8 /nobreak >nul
    
    REM Simple check - just offer to seed if user wants
    echo.
    set /p seed_choice="Would you like to populate the database with sample data? (y/N): "
    if /i "!seed_choice!"=="y" (
        echo.
        echo Seeding database with solar energy sample data...
        echo This will delete existing data and create fresh sample data...
        echo.
        docker exec -i solarwinds-postgres psql -U admin -d solarwinds < scripts\seed-database.sql
        if !errorlevel! equ 0 (
            echo Database seeded successfully!
        ) else (
            echo Error seeding database. Continuing anyway...
        )
    )
) else (
    echo PostgreSQL not started (Docker may not be available)
    echo Make sure Docker Desktop is running
)

echo.
echo Starting development services...
echo.

REM Install dependencies if needed
cd backend
if not exist "node_modules" (
    echo Installing backend dependencies...
    npm install >nul
)
echo Starting backend server (port 8001)...
start "Solar Winds Backend" cmd /c "npm run start:dev && pause"
cd ..

cd frontend
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install >nul
)
echo Starting frontend server (port 5173)...
start "Solar Winds Frontend" cmd /c "npm run dev && pause"
cd ..

echo.
echo Solar Winds development environment is starting!
echo.
echo Application URLs:
echo   Frontend Dashboard: http://localhost:5173
echo   Backend API: http://localhost:8001
echo   Database Admin (optional): http://localhost:5050
echo.
echo Tips:
echo   - Use Ctrl+C in the server windows to stop services
echo   - Run 'db-manage.bat status' to check database health
echo   - Run 'scripts\seed-data.bat' to add more sample data
echo.
echo For more commands, see DATABASE_SETUP.md
echo.
pause