#!/bin/zsh

# IndoQuran Web Docker Management Script
# This script serves as an entry point for all Docker-related operations

# Create deploy/.env.local from example if it doesn't exist
function setup_env {
  if [ ! -f "./.env.local" ]; then
    if [ -f "./.env.local.example" ]; then
      echo "ℹ️ Creating .env.local from example..."
      cp "./.env.local.example" "./.env.local"
      echo "✅ Created ./.env.local from example."
      echo "⚠️ Please edit the file with your settings before running the application."
    else
      echo "❌ Error: ./.env.local.example file not found!"
      exit 1
    fi
  fi
}

# Display help information
function show_help {
  echo "IndoQuran Web Docker Management Script"
  echo ""
  echo "Usage: $0 [command]"
  echo ""
  echo "Commands:"
  echo "  dev           Start the application in development mode"
  echo "  deploy        Deploy the application in production mode"
  echo "  backup        Back up the MySQL database"
  echo "  monitor       Monitor the running containers"
  echo "  volumes       Manage Docker volumes"
  echo "  setup-env     Create environment files from examples"
  echo "  scan          Scan Docker image for security vulnerabilities"
  echo "  help          Show this help message"
  echo ""
  echo "Example: $0 dev"
}

# Execute the selected command
if [ -z "$1" ]; then
  show_help
  exit 0
fi

case "$1" in
  dev)
    setup_env
    ./dev.sh
    ;;
  deploy)
    if [ ! -f "./.env.production" ]; then
      echo "❌ Error: ./.env.production file not found!"
      echo "Please create it from ./.env.production.example before deployment."
      exit 1
    fi
    ./deploy.sh
    ;;
  backup)
    ./backup-db.sh
    ;;
  monitor)
    ./monitor.sh
    ;;
  volumes)
    ./manage-volumes.sh
    ;;
  setup-env)
    setup_env
    echo "✅ Environment setup complete."
    ;;
  scan)
    echo "🔒 Running security scan on Docker image..."
    ./scan-security.sh --build
    ;;
  help)
    show_help
    ;;
  *)
    echo "Unknown command: $1"
    echo ""
    show_help
    exit 1
    ;;
esac
