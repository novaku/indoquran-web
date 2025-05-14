# MySQL Query Logging Tools

This directory contains tools for enabling and viewing MySQL query logs in the IndoQuran Web application.

## Setup

MySQL query logging has been enabled by default in the database connection configuration. All SQL queries executed through the application will be logged to:

```
/logs/mysql_queries.log
```

## Viewing Logs

Use the `view-mysql-logs.sh` script to view and analyze the MySQL query logs:

```bash
# View real-time logs (tail mode)
./scripts/view-mysql-logs.sh

# View all logs
./scripts/view-mysql-logs.sh --all

# View query statistics by table
./scripts/view-mysql-logs.sh --count

# Search for specific queries
./scripts/view-mysql-logs.sh --query "INSERT"

# Clear the log file
./scripts/view-mysql-logs.sh --clear
```

## How It Works

The query logging is implemented in `src/lib/db.ts` by:

1. Wrapping the MySQL connection pool's `query` and `execute` methods
2. Logging all queries and parameters to both console (when in DEBUG log level) and the log file
3. Preserving the original functionality of the database methods

## Log Format

Each log entry includes:
- Timestamp
- SQL query
- Parameter values (if any)

Example:
```
[2025-05-13T23:56:06.585Z] SELECT * FROM prayers LIMIT 10 -- Params: []
```

## Disabling Logging

To disable query logging, set the `LOG_LEVEL` environment variable to `INFO` instead of `DEBUG` in your `.env` file:

```
LOG_LEVEL=INFO
```

Note: This will only disable console logging. File logging will continue to ensure you can troubleshoot issues if needed.

## Performance Impact

Query logging does have a small performance impact, especially for high-traffic applications. It's recommended to disable it in production environments or enable it temporarily for debugging purposes.
