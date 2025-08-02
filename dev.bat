@echo off
echo Starting Solar Winds in development mode...

REM Create .env files if they don't exist
if not exist "backend\.env" if exist "backend\.env.example" copy "backend\.env.example" "backend\.env" >nul
if not exist "frontend\.env" if exist "frontend\.env.example" copy "frontend\.env.example" "frontend\.env" >nul

REM Try to start PostgreSQL (optional)
echo Attempting to start PostgreSQL...
docker-compose up -d >nul 2>&1
if %errorlevel% equ 0 (
    echo PostgreSQL started
) else (
    echo PostgreSQL not started (Docker may not be available)
)

echo.
echo Starting services...

REM Start backend
cd backend
if not exist "node_modules" npm install
start "Backend" cmd /c "npm run start:dev && pause"
cd ..

REM Start frontend
cd frontend
if not exist "node_modules" npm install
start "Frontend" cmd /c "npm run dev && pause"
cd ..

echo.
echo Services starting...
echo Frontend: http://localhost:5173
echo Backend: http://localhost:8000
echo.
echo Close the server windows to stop the services
pause