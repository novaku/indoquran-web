#!/bin/bash
# filepath: /Users/novaherdi/Documents/GitHub/indoquran-web/scripts/setup-logs.sh

# This script sets up logging directories for the application

# Default log directory
LOG_DIR="./logs"

# If an environment variable is set, use that instead
if [ -n "$LOG_FILE_PATH" ]; then
  LOG_DIR=$LOG_FILE_PATH
fi

echo "Setting up logging directory at $LOG_DIR"

# Create logging directory if it doesn't exist
mkdir -p $LOG_DIR

# Create placeholder log file with proper permissions
touch "$LOG_DIR/indoquran.log"

# Set permissions (adjust as needed for your environment)
chmod 755 $LOG_DIR
chmod 664 "$LOG_DIR/indoquran.log"

echo "Log directory and files created successfully!"
echo ""
echo "To view logs in real-time, use:"
echo "  tail -f $LOG_DIR/indoquran.log       # For application logs"

# Create .gitkeep to ensure directory is tracked by git
touch "$LOG_DIR/.gitkeep"
