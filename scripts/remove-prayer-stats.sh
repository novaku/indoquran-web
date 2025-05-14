#!/bin/bash
# Script to update the database schema to remove prayer_stats table

# Check if we have the right environment variables
if [ -z "$MYSQL_HOST" ] || [ -z "$MYSQL_USER" ] || [ -z "$MYSQL_PASSWORD" ] || [ -z "$MYSQL_DATABASE" ]; then
  echo "Please set MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE environment variables"
  echo "Example: MYSQL_HOST=localhost MYSQL_USER=root MYSQL_PASSWORD=password MYSQL_DATABASE=indoquran ./$0"
  exit 1
fi

echo "Running migration to remove prayer_stats table..."
mysql -h "$MYSQL_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" < ./deploy/mysql-init/05-remove-prayer-stats.sql
STATUS=$?

if [ $STATUS -eq 0 ]; then
  echo "Migration completed successfully"
else
  echo "Migration failed with status $STATUS"
  exit $STATUS
fi

echo "Done"
