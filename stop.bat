@echo off
echo ========================================
echo Solar Winds Application Stop Script
echo ========================================
echo.

echo Stopping Docker containers...
docker-compose down

if %errorlevel% neq 0 (
    echo Error: Failed to stop Docker containers
) else (
    echo Docker containers stopped successfully
)

echo.
echo Note: If backend/frontend servers are still running in separate windows,
echo please close those windows manually or press Ctrl+C in each window.
echo.

pause