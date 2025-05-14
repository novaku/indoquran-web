#!/bin/bash
# Script to view MySQL query logs in real-time

LOG_FILE="./logs/mysql_queries.log"
HIGHLIGHT=true  # Set to 'false' to disable color highlighting

if [ ! -f "$LOG_FILE" ]; then
  echo "MySQL query log file not found at $LOG_FILE"
  echo "Please run the application first to generate log entries"
  exit 1
fi

# Functions for color highlighting
highlight_sql() {
  if [[ "$HIGHLIGHT" == "true" && -x "$(command -v grep)" ]]; then
    # Use grep instead of sed for more reliable highlighting
    GREP_COLOR="1;36" grep --color=always -E "SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|ORDER BY|LIMIT|GROUP BY" |
    GREP_COLOR="1;33" grep --color=always -E "\\[.*\\]|$" |
    GREP_COLOR="1;32" grep --color=always -E "-- Params:.*|$"
  else
    # No highlighting
    cat
  fi
}

# Display header
echo -e "\x1b[1;35m========================================\x1b[0m"
echo -e "\x1b[1;35m       MySQL Query Log Viewer\x1b[0m"
echo -e "\x1b[1;35m========================================\x1b[0m"
echo "Usage: ./view-mysql-logs.sh [option]"
echo "  --all, -a    : Show all logs"
echo "  --count, -c  : Show query count by table"
echo "  --tail, -t   : Follow log in real-time (default)"
echo "  --query, -q  : Search for specific query type"
echo "  --clear      : Clear the log file"
echo "  --help       : Show this help"
echo -e "\x1b[1;35m========================================\x1b[0m"

# Process command line options
if [[ "$1" == "--all" || "$1" == "-a" ]]; then
  echo "Showing all query logs:"
  cat "$LOG_FILE" | grep -v "^--" | highlight_sql | less -R
elif [[ "$1" == "--count" || "$1" == "-c" ]]; then
  echo "Query count by table:"
  grep -o "FROM \w\+" "$LOG_FILE" | sort | uniq -c | sort -nr
  
  echo -e "\nQuery types:"
  grep -o "\]\s*[A-Z]\+" "$LOG_FILE" | sort | uniq -c | sort -nr
elif [[ "$1" == "--query" || "$1" == "-q" ]]; then
  if [ -z "$2" ]; then
    echo "Please specify a search term"
    echo "Example: ./view-mysql-logs.sh --query INSERT"
    exit 1
  fi
  echo "Showing queries containing '$2':"
  grep -i "$2" "$LOG_FILE" | highlight_sql | less -R
elif [[ "$1" == "--clear" ]]; then
  # Clear the log file but keep the header
  read -p "Are you sure you want to clear the log file? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    current_time=$(date)
    echo "-- MySQL Query Log Start $current_time --" > "$LOG_FILE"
    echo "Log file cleared"
  fi
elif [[ "$1" == "--help" ]]; then
  # Help has already been shown
  exit 0
else
  # Default: tail and follow the log file
  echo "Showing real-time query logs (last 10 entries):"
  echo "Press Ctrl+C to exit"
  echo
  tail -f -n 10 "$LOG_FILE" | highlight_sql
fi
