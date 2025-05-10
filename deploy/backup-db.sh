#!/bin/zsh

# IndoQuran Web Database Backup Script

# Change to the directory where this script is located
cd "$(dirname "$0")"

# Date format for backup files
DATE=$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR="../backups"

# Check if .env.production exists
if [ ! -f ./.env.production ]; then
  echo "❌ Error: .env.production file not found!"
  echo "Please create the .env.production file based on .env.production.example"
  exit 1
fi

# Load environment variables
source ./.env.production

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Back up MySQL database
echo "🔄 Creating MySQL backup..."
docker compose exec -T mysql mysqldump -u indoquran -p"$MYSQL_PASSWORD" indoquran_db > "$BACKUP_DIR/indoquran_db_$DATE.sql"

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "✅ MySQL backup created: $BACKUP_DIR/indoquran_db_$DATE.sql"
else
  echo "❌ MySQL backup failed!"
  exit 1
fi

# Compress the backup file
gzip "$BACKUP_DIR/indoquran_db_$DATE.sql"
echo "✅ Backup compressed: $BACKUP_DIR/indoquran_db_$DATE.sql.gz"

# List all backups
echo ""
echo "📁 Available backups:"
ls -lh "$BACKUP_DIR" | grep -v "total"
