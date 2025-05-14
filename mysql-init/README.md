# IndoQuran Web Database Initialization

This directory contains MySQL initialization scripts for the IndoQuran Web application database.

## Script Order

The scripts should be run in the following order:

1. `01-schema.sql` - Creates the main database schema
2. `02-contacts-schema.sql` - Creates tables for contact management
3. `03-notes-schema.sql` - Creates tables for user notes
4. `04-prayers-schema.sql` - Creates tables for prayer times and tracking
5. `05-remove-prayer-stats.sql` - Removes unused prayer statistics tables

## Automatic Database Setup

You can run all scripts automatically using the deployment script:

```bash
./deploy-production.sh --with-db
```

## Manual Setup

To run scripts manually, use:

```bash
mysql -u username -p database_name < mysql-init/01-schema.sql
# Repeat for each script in numerical order
```
