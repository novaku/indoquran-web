#!/bin/zsh

# IndoQuran Web Volume Management Script

# Change to the directory where this script is located
cd "$(dirname "$0")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to list volumes and their sizes
function list_volumes() {
  echo -e "${BLUE}📁 Docker volumes:${NC}"
  
  # List all volumes
  VOLUMES=($(docker volume ls -q | grep -E 'indoquran.*_(mysql|redis)-data'))
  
  if [ ${#VOLUMES[@]} -eq 0 ]; then
    echo -e "${YELLOW}No volumes found for IndoQuran Web.${NC}"
    return
  fi
  
  echo -e "Name\tSize"
  echo -e "--------------------"
  
  for VOLUME in "${VOLUMES[@]}"; do
    # Get volume size
    SIZE=$(docker run --rm -v $VOLUME:/data alpine sh -c "du -sh /data" | awk '{print $1}')
    echo -e "$VOLUME\t$SIZE"
  done
}

# Function to backup volumes
function backup_volumes() {
  echo -e "${BLUE}📦 Backing up volumes...${NC}"
  
  # Create backup directory if it doesn't exist
  BACKUP_DIR="../volume_backups"
  mkdir -p "$BACKUP_DIR"
  
  # Get current date for backup filename
  DATE=$(date +"%Y%m%d-%H%M%S")
  
  # Backup MySQL volume
  echo -e "${YELLOW}Backing up MySQL data...${NC}"
  docker run --rm -v indoquran-web_mysql-data:/data -v $(pwd)/$BACKUP_DIR:/backup alpine sh -c "cd /data && tar -czf /backup/mysql-data-$DATE.tar.gz ."
  
  # Backup Redis volume
  echo -e "${YELLOW}Backing up Redis data...${NC}"
  docker run --rm -v indoquran-web_redis-data:/data -v $(pwd)/$BACKUP_DIR:/backup alpine sh -c "cd /data && tar -czf /backup/redis-data-$DATE.tar.gz ."
  
  echo -e "${GREEN}✅ Volumes backed up to $BACKUP_DIR${NC}"
  ls -lh "$BACKUP_DIR" | grep "$DATE"
}

# Function to restore volumes
function restore_volumes() {
  echo -e "${BLUE}🔄 Restoring volumes...${NC}"
  
  # Check if backup directory exists
  BACKUP_DIR="../volume_backups"
  if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}❌ Backup directory not found!${NC}"
    return
  fi
  
  # List available backups
  echo -e "${YELLOW}Available backups:${NC}"
  ls -ltr "$BACKUP_DIR" | grep -v "total"
  
  # Ask which backup to restore
  echo -e "${YELLOW}Enter the MySQL backup filename to restore:${NC}"
  read MYSQL_BACKUP
  
  echo -e "${YELLOW}Enter the Redis backup filename to restore:${NC}"
  read REDIS_BACKUP
  
  # Check if backup files exist
  if [ ! -f "$BACKUP_DIR/$MYSQL_BACKUP" ] || [ ! -f "$BACKUP_DIR/$REDIS_BACKUP" ]; then
    echo -e "${RED}❌ One or both backup files not found!${NC}"
    return
  fi
  
  # Confirm before proceeding
  echo -e "${RED}WARNING: This will overwrite existing data in the volumes!${NC}"
  read -p "Are you sure you want to continue? (y/n): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Restore canceled.${NC}"
    return
  fi
  
  # Stop containers
  echo -e "${YELLOW}Stopping containers...${NC}"
  docker compose down
  
  # Restore MySQL volume
  echo -e "${YELLOW}Restoring MySQL data...${NC}"
  docker run --rm -v indoquran-web_mysql-data:/data -v $(pwd)/$BACKUP_DIR:/backup alpine sh -c "rm -rf /data/* && tar -xzf /backup/$MYSQL_BACKUP -C /data"
  
  # Restore Redis volume
  echo -e "${YELLOW}Restoring Redis data...${NC}"
  docker run --rm -v indoquran-web_redis-data:/data -v $(pwd)/$BACKUP_DIR:/backup alpine sh -c "rm -rf /data/* && tar -xzf /backup/$REDIS_BACKUP -C /data"
  
  # Start containers
  echo -e "${YELLOW}Starting containers...${NC}"
  docker compose up -d
  
  echo -e "${GREEN}✅ Volumes restored successfully!${NC}"
}

# Main menu
while true; do
  echo -e "${BLUE}==== IndoQuran Web Volume Management ====${NC}"
  echo "1) List volumes and sizes"
  echo "2) Backup volumes"
  echo "3) Restore volumes"
  echo "q) Quit"
  echo ""
  
  read -p "Select an option: " option
  
  case $option in
    1) list_volumes ;;
    2) backup_volumes ;;
    3) restore_volumes ;;
    q|Q) 
       echo -e "${GREEN}Exiting...${NC}"
       exit 0
       ;;
    *) 
       echo -e "${RED}Invalid option. Please try again.${NC}"
       ;;
  esac
  
  echo ""
  read -p "Press Enter to continue..."
done
