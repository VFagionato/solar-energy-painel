@echo off
echo ========================================
echo Solar Winds Application Startup Script
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: npm is not installed
    echo Please install npm
    pause
    exit /b 1
)

echo Node.js and npm are installed

REM Check if Docker is available
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Warning: Docker is not installed
    echo Please install Docker from https://www.docker.com/
    echo Continuing without MongoDB for now...
    set SKIP_DOCKER=true
) else (
    echo Docker is installed
    set SKIP_DOCKER=false
)

echo.
echo Setting up environment files...

REM Check if backend .env exists
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        echo Creating backend\.env from example...
        copy "backend\.env.example" "backend\.env" >nul
    ) else (
        echo Warning: backend\.env.example not found
    )
)

REM Check if frontend .env exists
if not exist "frontend\.env" (
    if exist "frontend\.env.example" (
        echo Creating frontend\.env from example...
        copy "frontend\.env.example" "frontend\.env" >nul
    ) else (
        echo Warning: frontend\.env.example not found
    )
)

echo Environment files ready

REM Start MongoDB if Docker is available
if "%SKIP_DOCKER%"=="false" (
    echo.
    echo Starting MongoDB database...
    docker-compose up -d >nul 2>&1
    if %errorlevel% equ 0 (
        echo MongoDB started successfully
        timeout /t 3 /nobreak >nul
    ) else (
        echo Warning: Could not start MongoDB with Docker
        echo You may need to start Docker Desktop
        echo Continuing without database...
    )
)

echo.
echo Installing dependencies...

REM Install backend dependencies
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install backend dependencies
        cd ..
        pause
        exit /b 1
    )
    echo Backend dependencies installed
    cd ..
) else (
    echo Backend dependencies already installed
)

REM Install frontend dependencies
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install frontend dependencies
        cd ..
        pause
        exit /b 1
    )
    echo Frontend dependencies installed
    cd ..
) else (
    echo Frontend dependencies already installed
)

echo.
echo ========================================
echo Starting Solar Winds Application...
echo ========================================
echo.

REM Start backend in background
echo Starting backend server...
start "Solar Winds Backend" cmd /c "cd backend && npm run start:dev && pause"

REM Wait a moment for backend to start
timeout /t 5 /nobreak >nul

REM Start frontend in background
echo Starting frontend server...
start "Solar Winds Frontend" cmd /c "cd frontend && npm run dev && pause"

echo.
echo ========================================
echo Application is starting up...
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3000
echo Health:   http://localhost:3000/health
echo.
echo Two new command windows have opened:
echo - One for the backend server
echo - One for the frontend server
echo.
echo To stop the application:
echo 1. Close both server windows (or press Ctrl+C in each)
echo 2. Run: stop.bat or docker-compose down
echo.

pause