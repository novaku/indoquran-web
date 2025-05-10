#!/bin/bash

# IndoQuran Web Deployment Script

# Change to the directory where this script is located
cd "$(dirname "$0")"

# Check if .env.production exists
if [ ! -f ./.env.production ]; then
  echo "❌ Error: .env.production file not found!"
  echo "Please create the .env.production file based on .env.production.example"
  exit 1
fi

# Load environment variables
source ./.env.production

# Verify environment variables
if [ -z "$MYSQL_ROOT_PASSWORD" ] || [ -z "$MYSQL_PASSWORD" ] || [ -z "$REDIS_PASSWORD" ] || [ -z "$NEXTAUTH_URL" ] || [ -z "$NEXTAUTH_SECRET" ]; then
  echo "❌ Error: Missing required environment variables in .env.production!"
  echo "Please check your .env.production file"
  exit 1
fi

# Create required directories if they don't exist
mkdir -p mysql-init

# Build and start the Docker containers
echo "🔄 Starting deployment process..."
docker compose -f ./docker-compose.yml --env-file ./.env.production up -d

# Check if containers started successfully
if [ $? -eq 0 ]; then
  echo "✅ Deployment successful!"
  echo "The application is now running at: $NEXTAUTH_URL"
  echo ""
  echo "Services running:"
  docker compose ps
else
  echo "❌ Deployment failed!"
  echo "Check logs with: docker compose logs"
  exit 1
fi
