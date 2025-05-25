#!/bin/bash

# Change to the application directory
cd "$(dirname "$0")"

# Ensure all dependencies are installed
echo "Installing dependencies..."
npm install --production

# Start the application in production mode
echo "Starting the application..."
NODE_ENV=production node server.js > logs/server.log 2>&1 &
echo $! > server.pid

echo "Server started with PID: $(cat server.pid)"
echo "Logs are being written to logs/server.log"
