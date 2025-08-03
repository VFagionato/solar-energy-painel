#!/bin/bash

# Solar Winds Database Management Script
# Provides easy commands for database operations

DB_CONTAINER="solarwinds-postgres"
DB_NAME="solarwinds"
DB_USER="admin"

show_help() {
    echo "🌞 Solar Winds Database Management"
    echo ""
    echo "Usage: ./db-manage.sh <command>"
    echo ""
    echo "Commands:"
    echo "  start       Start PostgreSQL database"
    echo "  stop        Stop PostgreSQL database"
    echo "  restart     Restart PostgreSQL database"
    echo "  status      Show database status"
    echo "  logs        Show database logs"
    echo "  connect     Connect to database (psql)"
    echo "  backup      Create database backup"
    echo "  restore     List available backups for restore"
    echo "  reset       Reset database (WARNING: deletes all data)"
    echo "  pgadmin     Start PgAdmin (web interface)"
    echo "  health      Check database health"
    echo "  help        Show this help"
    echo ""
    echo "Examples:"
    echo "  ./db-manage.sh start"
    echo "  ./db-manage.sh backup"
    echo "  ./db-manage.sh connect"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "❌ Error: Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        echo "❌ Error: Docker is not running"
        exit 1
    fi
}

case $1 in
    start)
        echo "🚀 Starting PostgreSQL database..."
        docker-compose up -d postgres
        echo "⏳ Waiting for database to be ready..."
        sleep 5
        docker exec $DB_CONTAINER pg_isready -U $DB_USER -d $DB_NAME
        ;;
    
    stop)
        echo "🛑 Stopping PostgreSQL database..."
        docker-compose stop postgres
        ;;
    
    restart)
        echo "🔄 Restarting PostgreSQL database..."
        docker-compose restart postgres
        echo "⏳ Waiting for database to be ready..."
        sleep 5
        docker exec $DB_CONTAINER pg_isready -U $DB_USER -d $DB_NAME
        ;;
    
    status)
        echo "📊 Database Status:"
        if docker ps | grep -q $DB_CONTAINER; then
            echo "✅ PostgreSQL is running"
            docker exec $DB_CONTAINER pg_isready -U $DB_USER -d $DB_NAME
            echo ""
            echo "Container stats:"
            docker stats $DB_CONTAINER --no-stream
        else
            echo "❌ PostgreSQL is not running"
        fi
        ;;
    
    logs)
        echo "📝 Database Logs:"
        docker-compose logs postgres
        ;;
    
    connect)
        echo "🔌 Connecting to database..."
        if docker ps | grep -q $DB_CONTAINER; then
            docker exec -it $DB_CONTAINER psql -U $DB_USER -d $DB_NAME
        else
            echo "❌ Error: PostgreSQL container is not running"
            exit 1
        fi
        ;;
    
    backup)
        echo "💾 Creating database backup..."
        ./db-backup.sh
        ;;
    
    restore)
        echo "📋 Available backups:"
        ls -lh ./backups/ 2>/dev/null || echo "No backups found"
        echo ""
        echo "To restore a backup, run:"
        echo "./db-restore.sh <backup_filename>"
        ;;
    
    reset)
        read -p "⚠️  This will DELETE ALL DATA. Are you sure? (type 'YES' to confirm): " -r
        if [[ $REPLY == "YES" ]]; then
            echo "🗑️  Resetting database..."
            docker-compose down postgres
            docker volume rm solar-winds_postgres_data 2>/dev/null || true
            docker-compose up -d postgres
            echo "✅ Database reset complete"
        else
            echo "❌ Reset cancelled"
        fi
        ;;
    
    pgadmin)
        echo "🌐 Starting PgAdmin..."
        docker-compose --profile dev up -d pgadmin
        echo "✅ PgAdmin started at: http://localhost:5050"
        echo "📧 Email: admin@solarwinds.com"
        echo "🔐 Password: admin123"
        ;;
    
    health)
        echo "🏥 Checking database health..."
        if docker ps | grep -q $DB_CONTAINER; then
            docker exec $DB_CONTAINER pg_isready -U $DB_USER -d $DB_NAME
            echo ""
            echo "Health check table:"
            docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "SELECT * FROM health_check ORDER BY checked_at DESC LIMIT 1;"
        else
            echo "❌ Error: PostgreSQL container is not running"
            exit 1
        fi
        ;;
    
    help|--help|-h)
        show_help
        ;;
    
    *)
        echo "❌ Error: Unknown command '$1'"
        echo ""
        show_help
        exit 1
        ;;
esac