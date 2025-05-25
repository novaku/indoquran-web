#!/bin/bash

# IndoQuran Server Management Script
# This script provides simple commands to manage the server application

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Change to the application directory
cd "$(dirname "$0")"

# Function to show usage
show_usage() {
  echo -e "${BLUE}IndoQuran Server Management${NC}"
  echo ""
  echo "Usage: ./manage.sh [command]"
  echo ""
  echo "Commands:"
  echo "  start        Start the server"
  echo "  stop         Stop the server"
  echo "  restart      Restart the server"
  echo "  status       Check server status"
  echo "  logs         Show server logs"
  echo "  setup-cron   Setup monitoring cron job"
  echo "  env          Show environment variables"
  echo "  help         Show this help message"
  echo ""
}

# Function to check server status
check_status() {
  if [ -f server.pid ]; then
    PID=$(cat server.pid)
    if ps -p $PID > /dev/null; then
      echo -e "${GREEN}Server is running with PID: $PID${NC}"
      return 0
    else
      echo -e "${YELLOW}Server is not running (stale PID file)${NC}"
      return 1
    fi
  else
    echo -e "${YELLOW}Server is not running (no PID file)${NC}"
    return 1
  fi
}

# Function to setup cron job
setup_cron() {
  CRON_JOB="*/5 * * * * cd $(pwd) && ./monitor.sh > /dev/null 2>&1"
  
  # Check if cron job already exists
  if crontab -l | grep -q "monitor.sh"; then
    echo -e "${YELLOW}Cron job already exists.${NC}"
  else
    # Add the cron job
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo -e "${GREEN}Cron job added successfully.${NC}"
  fi
  
  echo -e "${BLUE}Current cron jobs:${NC}"
  crontab -l
}

# Function to view logs
view_logs() {
  if [ -f logs/server.log ]; then
    echo -e "${BLUE}Showing last 50 lines of server logs:${NC}"
    tail -n 50 logs/server.log
    echo ""
    echo -e "${BLUE}To follow logs in real-time, use:${NC} tail -f logs/server.log"
  else
    echo -e "${YELLOW}No log file found at logs/server.log${NC}"
  fi
}

# Function to show environment
show_env() {
  echo -e "${BLUE}Environment Variables:${NC}"
  NODE_ENV=production node -e "console.log(JSON.stringify(process.env, null, 2))" | grep -v -E "(_|PATH=|HOME=|SHELL=|USER=|LOGNAME=)"
}

# Process command
case "$1" in
  start)
    ./start-production.sh
    echo -e "${GREEN}Server started.${NC}"
    ;;
  stop)
    ./stop-production.sh
    echo -e "${RED}Server stopped.${NC}"
    ;;
  restart)
    ./stop-production.sh
    sleep 2
    ./start-production.sh
    echo -e "${GREEN}Server restarted.${NC}"
    ;;
  status)
    check_status
    ;;
  logs)
    view_logs
    ;;
  setup-cron)
    setup_cron
    ;;
  env)
    show_env
    ;;
  help|*)
    show_usage
    ;;
esac

exit 0
