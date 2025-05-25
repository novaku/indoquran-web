#!/bin/bash

# Change to the application directory
cd "$(dirname "$0")"

# Check if the server is running
if [ -f server.pid ]; then
  PID=$(cat server.pid)
  if ps -p $PID > /dev/null; then
    echo "Stopping server with PID: $PID"
    kill $PID
    rm server.pid
    echo "Server stopped"
  else
    echo "Server is not running (stale PID file)"
    rm server.pid
  fi
else
  echo "Server is not running (no PID file)"
fi
