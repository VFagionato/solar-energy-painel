#!/bin/bash

# Solar Winds Database Restore Script
# Usage: ./db-restore.sh <backup_file>

if [ $# -eq 0 ]; then
    echo "❌ Error: Please provide a backup file"
    echo "Usage: ./db-restore.sh <backup_file>"
    echo ""
    echo "Available backups:"
    ls -1 ./backups/ 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE=$1
BACKUP_DIR="./backups"
DB_CONTAINER="solarwinds-postgres"
DB_NAME="solarwinds"
DB_USER="admin"

# Check if backup file exists
if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    echo "❌ Error: Backup file not found: $BACKUP_DIR/$BACKUP_FILE"
    exit 1
fi

echo "🔄 Restoring from backup: $BACKUP_FILE"

# Check if container is running
if ! docker ps | grep -q $DB_CONTAINER; then
    echo "❌ Error: PostgreSQL container is not running"
    echo "Run 'docker-compose up -d postgres' first"
    exit 1
fi

# Ask for confirmation
read -p "⚠️  This will overwrite the current database. Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Restore cancelled"
    exit 1
fi

# Determine if file is compressed
if [[ $BACKUP_FILE == *.gz ]]; then
    echo "📦 Decompressing backup..."
    # Copy and decompress to container
    docker exec -i $DB_CONTAINER bash -c "zcat" < "$BACKUP_DIR/$BACKUP_FILE" | docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME
else
    # Restore from uncompressed SQL file
    docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME < "$BACKUP_DIR/$BACKUP_FILE"
fi

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully from: $BACKUP_FILE"
else
    echo "❌ Error: Restore failed"
    exit 1
fi

echo "🔍 Verifying restore..."
docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) as health_check FROM health_check;"