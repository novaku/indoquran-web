#!/bin/bash
# IndoQuran Web Production Deployment Script
# Author: Nova Herdi
# Date: May 14, 2025
# Description: Automates the deployment of IndoQuran Web application to production environment

set -e  # Exit immediately if a command exits with a non-zero status

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Change to the repository root directory (already in root directory)
ROOT_DIR=$(pwd)
echo -e "${YELLOW}📂 Working directory: ${ROOT_DIR}${NC}"

# Check if .env.production exists
if [ ! -f ./.env.production ]; then
  echo -e "${RED}❌ Error: .env.production file not found!${NC}"
  echo -e "Please create it by copying from .env.production.example"
  echo -e "cp .env.production.example .env.production"
  exit 1
fi

# Install dependencies
echo -e "${GREEN}📦 Installing dependencies...${NC}"
npm ci

# Build the application
echo -e "${GREEN}🔨 Building application...${NC}"
npm run build

# Run database initialization scripts if --with-db flag is provided
if [ "$1" == "--with-db" ]; then
  echo -e "${GREEN}🗄️ Setting up database...${NC}"
  
  # Source the production environment to get database credentials
  source ./.env.production
  
  # If the variables aren't explicitly named in the file, try to extract from DATABASE_URL
  if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
    if [ -n "$DATABASE_URL" ]; then
      # Extract credentials from DATABASE_URL (e.g., mysql://user:password@host:port/dbname)
      DB_USER=$(echo $DATABASE_URL | grep -o '[^\/]*:[^@]*@' | sed 's/:.*//' )
      DB_PASSWORD=$(echo $DATABASE_URL | grep -o '[^\/]*:[^@]*@' | sed 's/.*://' | sed 's/@//' )
      DB_HOST=$(echo $DATABASE_URL | grep -o '@[^:]*:' | sed 's/@//' | sed 's/://')
      DB_PORT=$(echo $DATABASE_URL | grep -o ':[0-9]*/' | sed 's/[:/]//g')
      DB_NAME=$(echo $DATABASE_URL | grep -o '/[^?]*$' | sed 's/\///')
    else
      echo -e "${RED}❌ Error: Database credentials not found in .env.production!${NC}"
      echo -e "Please ensure DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME are set or use DATABASE_URL."
      exit 1
    fi
  fi
  
  # Initialize the database by running all SQL scripts
  echo -e "${GREEN}🗃️ Running database initialization scripts...${NC}"
  for SQL_FILE in ./mysql-init/*.sql; do
    echo -e "${YELLOW}Executing: $(basename "$SQL_FILE")${NC}"
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$SQL_FILE"
    
    # Check if the script executed successfully
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✓ Successfully executed $(basename "$SQL_FILE")${NC}"
    else
      echo -e "${RED}❌ Failed to execute $(basename "$SQL_FILE")${NC}"
      echo -e "${YELLOW}Continuing with deployment...${NC}"
    fi
  done
fi

# Start the production server
echo -e "${GREEN}🚀 Starting production server...${NC}"
pm2 delete indoquran-web 2>/dev/null || true # Delete if exists
pm2 start npm --name "indoquran-web" -- start

echo -e "${GREEN}✅ Deployment completed!${NC}"
echo -e "${YELLOW}To check status: ${NC}pm2 status"
echo -e "${YELLOW}To view logs: ${NC}pm2 logs indoquran-web"
