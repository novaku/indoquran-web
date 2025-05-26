# Simplified Jagoanhosting Deployment Guide

This guide outlines the simplified process for deploying this Next.js application to Jagoanhosting using only the essential files and focusing on server.js.

## Overview

This simplified approach focuses on deploying only the essential files needed to run the application in production:

- `server.js` - The enhanced server file that contains all necessary functionality
- `.next/` - The compiled Next.js application
- `public/` - Static assets
- `package.json` - Dependencies 
- `next.config.js` - Next.js configuration
- `.env.production` - Environment variables

## Deployment Steps

### 1. Local Preparation

```bash
# Ensure you have the production environment file
cp .env.production.example .env.production
# Edit .env.production with your production values

# Use the simplified deployment script
./deploy-simplified.sh
```

### 2. Server Setup

Upload the files from `deploy-temp` directory to your Jagoanhosting server, or use the `.cpanel.yml` approach with Git deployment.

### 3. Start the Application

SSH into your Jagoanhosting server and navigate to your application directory:

```bash
cd /home/indoqura/indoquran

# Install dependencies (first time only)
npm install --production

# Start the server
NODE_ENV=production node server.js
```

## Running as a Background Service

To run the server as a background service that persists after you log out, use one of these approaches:

### Using nohup

```bash
nohup NODE_ENV=production node server.js > logs/nohup.log 2>&1 &
echo $! > server.pid
```

### Using pm2 (if available)

If pm2 is available on your server, it's the recommended way to run Node.js applications:

```bash
# Install pm2 if not already installed
npm install -g pm2

# Start the application with pm2
pm2 start server.js --name "indoquran" --env production

# Make sure it restarts on server reboot
pm2 save
pm2 startup
```

## Monitoring

The server.js file includes built-in logging to the logs directory and creates a server.pid file that can be used for monitoring.

To check if the server is running:

```bash
if [ -f server.pid ] && ps -p $(cat server.pid) > /dev/null; then
  echo "Server is running"
else
  echo "Server is not running"
fi
```

## Logs

All server logs are written to the `logs/server.log` file. You can view them with:

```bash
tail -f logs/server.log
```

## Restarting

To restart the server, you'll need to:

1. Find the process ID
2. Kill it
3. Start the server again

```bash
# If you have the server.pid file
kill $(cat server.pid)
rm server.pid
NODE_ENV=production node server.js
```

## Security Notes

1. Make sure your server has proper firewall rules
2. Consider setting up a reverse proxy like Nginx in front of your Node.js application
3. Implement rate limiting if needed by modifying server.js