#!/bin/bash

# Script to add prayer tables to an existing database
# Make sure to set permissions: chmod +x update-db-prayers.sh

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
MYSQL_INIT_DIR="${SCRIPT_DIR}/../deploy/mysql-init"
PRAYER_SCHEMA="${MYSQL_INIT_DIR}/04-prayers-schema.sql"

# Check if the prayer schema file exists
if [ ! -f "$PRAYER_SCHEMA" ]; then
  echo "Error: Prayer schema file not found at ${PRAYER_SCHEMA}"
  exit 1
fi

# Database credentials (prompt for them)
read -p "Enter database host [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Enter database port [3306]: " DB_PORT
DB_PORT=${DB_PORT:-3306}

read -p "Enter database name [indoquran]: " DB_NAME
DB_NAME=${DB_NAME:-indoquran}

read -p "Enter database user [root]: " DB_USER
DB_USER=${DB_USER:-root}

read -sp "Enter database password: " DB_PASS
echo ""

# Execute the prayer schema SQL
echo "Adding prayer tables to database ${DB_NAME}..."
mysql -h${DB_HOST} -P${DB_PORT} -u${DB_USER} -p${DB_PASS} ${DB_NAME} < ${PRAYER_SCHEMA}

if [ $? -eq 0 ]; then
  echo "Successfully added prayer tables to the database."
else
  echo "Failed to add prayer tables. Please check your credentials and try again."
  exit 1
fi

echo "Done."
