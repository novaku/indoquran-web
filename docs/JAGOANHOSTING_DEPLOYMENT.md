# Jagoanhosting Deployment Guide

This guide outlines the process for deploying this Next.js application to Jagoanhosting using cPanel and Git deployment.

## Prerequisites

1. A Jagoanhosting account with cPanel access
2. Git repository access
3. Node.js installed on the Jagoanhosting server (contact support if needed)

## Deployment Files

The following files are used in the deployment process:

- `.cpanel.yml` - Defines how files are deployed to the server
- `.env.production` - Contains production environment variables
- `server.js` - Custom Node.js server for running the application
- `start-production.sh` - Script to start the application on the server
- `stop-production.sh` - Script to stop the application on the server
- `monitor.sh` - Script to monitor and automatically restart the application if it crashes
- `manage.sh` - Management script with various commands for server management
- `prepare-deploy.sh` - Script to prepare files for deployment

## Deployment Steps

### 1. Local Preparation

```bash
# Ensure you have the production environment file
cp .env.production.example .env.production
# Edit .env.production with your production values

# Prepare deployment package
./prepare-deploy.sh
```

### 2. Git Push

Push your changes to the Git repository connected to Jagoanhosting:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 3. cPanel Deployment

The `.cpanel.yml` file will automatically copy the necessary files to your server directory.

### 4. Server Setup

SSH into your Jagoanhosting server and navigate to your application directory:

```bash
cd /home/indoqura/indoquran
```

### 5. Server Management

Use the management script to control your application:

```bash
# Start the application
./manage.sh start

# Check status
./manage.sh status

# View logs
./manage.sh logs

# Stop the application
./manage.sh stop

# Restart the application
./manage.sh restart

# Set up cron job for automatic monitoring
./manage.sh setup-cron

# View environment variables
./manage.sh env

# Show help
./manage.sh help
```

## Troubleshooting

### Check Logs

To view server logs:

```bash
./manage.sh logs
# Or directly:
tail -f logs/server.log
```

### Check Environment Variables

To verify environment variables are loaded correctly:

```bash
./manage.sh env
```

### Restart the Application

If you need to restart the application:

```bash
./manage.sh restart
```

## Monitoring

The application includes automatic monitoring:

1. Set up the monitoring cron job:
   ```bash
   ./manage.sh setup-cron
   ```

This will create a cron job that checks every 5 minutes if the application is running and starts it if not.

## Updating

To update your application:

1. Make changes to your code
2. Run `./prepare-deploy.sh`
3. Push changes to Git
4. SSH into the server
5. Run `./manage.sh restart`
