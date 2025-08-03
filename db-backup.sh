#!/bin/bash

# Solar Winds Database Backup Script
# Usage: ./db-backup.sh [backup_name]

BACKUP_NAME=${1:-"backup_$(date +%Y%m%d_%H%M%S)"}
BACKUP_DIR="./backups"
DB_CONTAINER="solarwinds-postgres"
DB_NAME="solarwinds"
DB_USER="admin"

echo "🔄 Creating backup: $BACKUP_NAME"

# Create backups directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Check if container is running
if ! docker ps | grep -q $DB_CONTAINER; then
    echo "❌ Error: PostgreSQL container is not running"
    echo "Run 'docker-compose up -d postgres' first"
    exit 1
fi

# Create backup
docker exec $DB_CONTAINER pg_dump -U $DB_USER -d $DB_NAME > "$BACKUP_DIR/${BACKUP_NAME}.sql"

if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: $BACKUP_DIR/${BACKUP_NAME}.sql"
    
    # Compress the backup
    gzip "$BACKUP_DIR/${BACKUP_NAME}.sql"
    echo "📦 Backup compressed: $BACKUP_DIR/${BACKUP_NAME}.sql.gz"
    
    # Show backup size
    echo "📊 Backup size: $(du -h "$BACKUP_DIR/${BACKUP_NAME}.sql.gz" | cut -f1)"
else
    echo "❌ Error: Backup failed"
    exit 1
fi

# List all backups
echo ""
echo "📋 Available backups:"
ls -lh $BACKUP_DIR/