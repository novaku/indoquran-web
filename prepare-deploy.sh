#!/bin/bash

# Check if .env.production exists
if [ ! -f ./.env.production ]; then
  echo "Error: .env.production file not found!"
  echo "Please create it by copying from .env.production.example"
  echo "cp .env.production.example .env.production"
  exit 1
fi

# Build the Next.js application
echo "Building Next.js application..."
npm run build

# Create deploy-package directory if it doesn't exist
mkdir -p deploy-package
mkdir -p deploy-package/deploy
mkdir -p deploy-package/logs

# Copy necessary files to deploy-package
echo "Preparing deployment package..."
cp -R .next deploy-package/
cp -R node_modules deploy-package/
cp next.config.js deploy-package/
cp server.js deploy-package/
cp package.json deploy-package/
cp .env.production deploy-package/
cp .env.production deploy-package/deploy/
cp start-production.sh deploy-package/
cp stop-production.sh deploy-package/
cp monitor.sh deploy-package/
cp manage.sh deploy-package/
chmod +x deploy-package/start-production.sh deploy-package/stop-production.sh deploy-package/monitor.sh deploy-package/manage.sh

echo "Deployment package prepared successfully."
echo "You can now push to your repository to trigger cPanel deployment."
