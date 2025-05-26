# Jagoanhosting Deployment Guide

**NOTE: This document is deprecated. Please refer to [SIMPLIFIED_DEPLOYMENT.md](./SIMPLIFIED_DEPLOYMENT.md) for the current deployment approach.**

The deployment process has been simplified to focus only on server.js and essential files, removing the dependency on shell scripts.

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
