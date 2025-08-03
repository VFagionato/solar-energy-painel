@echo off
REM Solar Winds Database Management Script for Windows
REM Provides easy commands for database operations

set DB_CONTAINER=solarwinds-postgres
set DB_NAME=solarwinds
set DB_USER=admin

if "%1"=="" goto help
if "%1"=="help" goto help
if "%1"=="--help" goto help
if "%1"=="-h" goto help

if "%1"=="start" goto start
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart
if "%1"=="status" goto status
if "%1"=="logs" goto logs
if "%1"=="connect" goto connect
if "%1"=="backup" goto backup
if "%1"=="restore" goto restore
if "%1"=="reset" goto reset
if "%1"=="pgadmin" goto pgadmin
if "%1"=="health" goto health

echo ❌ Error: Unknown command '%1'
echo.
goto help

:help
echo 🌞 Solar Winds Database Management
echo.
echo Usage: db-manage.bat ^<command^>
echo.
echo Commands:
echo   start       Start PostgreSQL database
echo   stop        Stop PostgreSQL database
echo   restart     Restart PostgreSQL database
echo   status      Show database status
echo   logs        Show database logs
echo   connect     Connect to database (psql)
echo   backup      Create database backup
echo   restore     List available backups for restore
echo   reset       Reset database (WARNING: deletes all data)
echo   pgadmin     Start PgAdmin (web interface)
echo   health      Check database health
echo   help        Show this help
echo.
echo Examples:
echo   db-manage.bat start
echo   db-manage.bat backup
echo   db-manage.bat connect
goto end

:start
echo 🚀 Starting PostgreSQL database...
docker-compose up -d postgres
echo ⏳ Waiting for database to be ready...
timeout /t 5 /nobreak > nul
docker exec %DB_CONTAINER% pg_isready -U %DB_USER% -d %DB_NAME%
goto end

:stop
echo 🛑 Stopping PostgreSQL database...
docker-compose stop postgres
goto end

:restart
echo 🔄 Restarting PostgreSQL database...
docker-compose restart postgres
echo ⏳ Waiting for database to be ready...
timeout /t 5 /nobreak > nul
docker exec %DB_CONTAINER% pg_isready -U %DB_USER% -d %DB_NAME%
goto end

:status
echo 📊 Database Status:
docker ps | findstr %DB_CONTAINER% > nul
if %errorlevel%==0 (
    echo ✅ PostgreSQL is running
    docker exec %DB_CONTAINER% pg_isready -U %DB_USER% -d %DB_NAME%
    echo.
    echo Container stats:
    docker stats %DB_CONTAINER% --no-stream
) else (
    echo ❌ PostgreSQL is not running
)
goto end

:logs
echo 📝 Database Logs:
docker-compose logs postgres
goto end

:connect
echo 🔌 Connecting to database...
docker ps | findstr %DB_CONTAINER% > nul
if %errorlevel%==0 (
    docker exec -it %DB_CONTAINER% psql -U %DB_USER% -d %DB_NAME%
) else (
    echo ❌ Error: PostgreSQL container is not running
)
goto end

:backup
echo 💾 Creating database backup...
set BACKUP_NAME=backup_%date:~6,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_NAME=%BACKUP_NAME: =0%
if not exist backups mkdir backups
docker exec %DB_CONTAINER% pg_dump -U %DB_USER% -d %DB_NAME% > backups\%BACKUP_NAME%.sql
echo ✅ Backup created: backups\%BACKUP_NAME%.sql
goto end

:restore
echo 📋 Available backups:
if exist backups (
    dir /b backups\*.sql
) else (
    echo No backups found
)
echo.
echo To restore a backup, manually run:
echo docker exec -i %DB_CONTAINER% psql -U %DB_USER% -d %DB_NAME% ^< backups\^<backup_filename^>
goto end

:reset
set /p confirm="⚠️  This will DELETE ALL DATA. Are you sure? (type 'YES' to confirm): "
if "%confirm%"=="YES" (
    echo 🗑️  Resetting database...
    docker-compose down postgres
    docker volume rm solar-winds_postgres_data 2>nul
    docker-compose up -d postgres
    echo ✅ Database reset complete
) else (
    echo ❌ Reset cancelled
)
goto end

:pgadmin
echo 🌐 Starting PgAdmin...
docker-compose --profile dev up -d pgadmin
echo ✅ PgAdmin started at: http://localhost:5050
echo 📧 Email: admin@solarwinds.com
echo 🔐 Password: admin123
goto end

:health
echo 🏥 Checking database health...
docker ps | findstr %DB_CONTAINER% > nul
if %errorlevel%==0 (
    docker exec %DB_CONTAINER% pg_isready -U %DB_USER% -d %DB_NAME%
    echo.
    echo Health check table:
    docker exec %DB_CONTAINER% psql -U %DB_USER% -d %DB_NAME% -c "SELECT * FROM health_check ORDER BY checked_at DESC LIMIT 1;"
) else (
    echo ❌ Error: PostgreSQL container is not running
)
goto end

:end