#!/bin/zsh

# IndoQuran Web Development Script

# Change to the directory where this script is located
cd "$(dirname "$0")"

# Check if .env.local exists
if [ ! -f ./.env.local ]; then
  echo "ℹ️ .env.local file not found, creating from example..."
  if [ -f ./.env.local.example ]; then
    cp ./.env.local.example ./.env.local
    echo "✅ Created .env.local from example."
  else
    echo "❌ Error: .env.local.example file not found!"
    exit 1
  fi
fi

# Load environment variables
source ./.env.local

# Start the Docker containers in development mode
echo "🔄 Starting development environment..."
docker compose -f ./docker-compose.yml -f ./docker-compose.override.yml --env-file ./.env.local up -d

# Check if containers started successfully
if [ $? -eq 0 ]; then
  echo "✅ Development environment is now running!"
  echo "The application is accessible at: $NEXTAUTH_URL"
  echo ""
  echo "Services running:"
  docker compose ps
  
  echo ""
  echo "📝 Development logs:"
  docker compose logs -f web
else
  echo "❌ Failed to start development environment!"
  echo "Check logs with: docker compose logs"
  exit 1
fi
