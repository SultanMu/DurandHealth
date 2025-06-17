#!/bin/bash

# DurandHealth backup script
set -e

BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="durandhealth_backup_${TIMESTAMP}.sql"

echo "Creating backup of DurandHealth database..."

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create database backup
docker-compose exec postgres pg_dump -U postgres durandhealth > "${BACKUP_DIR}/${BACKUP_FILE}"

# Compress backup
gzip "${BACKUP_DIR}/${BACKUP_FILE}"

echo "Backup created: ${BACKUP_DIR}/${BACKUP_FILE}.gz"

# Keep only last 7 backups
cd $BACKUP_DIR
ls -t durandhealth_backup_*.sql.gz | tail -n +8 | xargs rm -f

echo "Backup completed successfully"
echo "Available backups:"
ls -la durandhealth_backup_*.sql.gz