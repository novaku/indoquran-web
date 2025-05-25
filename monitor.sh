#!/bin/bash

# Change to the application directory
cd "$(dirname "$0")"

# Check if logs directory exists
if [ ! -d "logs" ]; then
  mkdir -p logs
fi

# Check if the server is running
if [ -f server.pid ]; then
  PID=$(cat server.pid)
  if ps -p $PID > /dev/null; then
    echo "$(date): Server is running with PID: $PID" >> logs/monitor.log
    exit 0
  else
    echo "$(date): Server PID $PID is not running. Removing stale PID file." >> logs/monitor.log
    rm server.pid
  fi
fi

# Server is not running, start it
echo "$(date): Starting server..." >> logs/monitor.log
./start-production.sh
echo "$(date): Server started with PID: $(cat server.pid)" >> logs/monitor.log
