#!/bin/zsh

# IndoQuran Web Monitoring Script

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

# Function to display container stats
function show_stats() {
  echo ""
  echo "📊 Container Stats:"
  docker stats --no-stream $(docker compose ps -q)
}

# Function to display logs
function show_logs() {
  echo ""
  echo "📝 Container Logs:"
  docker compose logs --tail=50
}

# Function to check service health
function check_health() {
  echo ""
  echo "🩺 Service Health:"
  
  # Check web service
  WEB_HEALTH=$(docker compose exec -T web wget -qO- http://localhost:3000/api/health || echo "unhealthy")
  if [[ $WEB_HEALTH == *"\"status\":\"ok\""* ]]; then
    echo "✅ Web service: Healthy"
  else
    echo "❌ Web service: Unhealthy"
  fi
  
  # Check MySQL service
  MYSQL_HEALTH=$(docker compose exec -T mysql mysqladmin ping -h localhost -u indoquran -p$MYSQL_PASSWORD || echo "unhealthy")
  if [[ $MYSQL_HEALTH == *"alive"* ]]; then
    echo "✅ MySQL service: Healthy"
  else
    echo "❌ MySQL service: Unhealthy"
  fi
  
  # Check Redis service
  REDIS_HEALTH=$(docker compose exec -T redis redis-cli -a $REDIS_PASSWORD ping || echo "unhealthy")
  if [[ $REDIS_HEALTH == "PONG" ]]; then
    echo "✅ Redis service: Healthy"
  else
    echo "❌ Redis service: Unhealthy"
  fi
}

# Main menu
while true; do
  echo ""
  echo "==== IndoQuran Web Monitoring ===="
  echo "1) Show container stats"
  echo "2) Show logs"
  echo "3) Check service health"
  echo "4) Restart all services"
  echo "5) Restart web service only"
  echo "6) Create database backup"
  echo "q) Quit"
  echo ""
  
  read -p "Select an option: " option
  
  case $option in
    1) show_stats ;;
    2) show_logs ;;
    3) check_health ;;
    4) 
       echo "Restarting all services..."
       docker compose restart
       ;;
    5) 
       echo "Restarting web service..."
       docker compose restart web
       ;;
    6) 
       echo "Creating database backup..."
       ./backup-db.sh
       ;;
    q|Q) 
       echo "Exiting..."
       exit 0
       ;;
    *) 
       echo "Invalid option. Please try again."
       ;;
  esac
  
  echo ""
  read -p "Press Enter to continue..."
done
