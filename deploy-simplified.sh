#!/bin/bash

# Simple deployment script focusing only on server.js

# Check if .env.production exists
if [ ! -f ./.env.production ]; then
  echo "Error: .env.production file not found!"
  echo "Please create it by copying from .env.production.example"
  echo "cp .env.production.example .env.production"
  exit 1
fi

# Build the Next.js application
echo "Building Next.js application..."
npm run build

# Create a temp directory for deployment
DEPLOY_DIR="./deploy-temp"
mkdir -p $DEPLOY_DIR
mkdir -p $DEPLOY_DIR/logs

# Copy only the essential files
echo "Preparing deployment files..."
cp -R .next $DEPLOY_DIR/
mkdir -p $DEPLOY_DIR/public
cp -R public/* $DEPLOY_DIR/public/
cp next.config.js $DEPLOY_DIR/
cp package.json $DEPLOY_DIR/
cp server.js $DEPLOY_DIR/
cp .env.production $DEPLOY_DIR/

# Create simple start/stop scripts
cat > $DEPLOY_DIR/start.sh << 'EOF'
#!/bin/bash

# Simple startup script for Jagoanhosting

# Create logs directory if it doesn't exist
mkdir -p logs

# Check if the application is already running
if [ -f server.pid ] && ps -p $(cat server.pid) > /dev/null; then
  echo "Application is already running with PID: $(cat server.pid)"
  exit 0
fi

# Start the application
echo "Starting application..."
NODE_ENV=production nohup node server.js > logs/nohup.log 2>&1 &

# Save the PID
echo $! > server.pid
echo "Application started with PID: $!"
echo "Logs are being written to logs/nohup.log"
EOF

cat > $DEPLOY_DIR/stop.sh << 'EOF'
#!/bin/bash

# Simple shutdown script for Jagoanhosting

# Check if the application is running
if [ ! -f server.pid ]; then
  echo "No server.pid file found. Application may not be running."
  exit 0
fi

# Get the PID
PID=$(cat server.pid)

# Check if the process is running
if ps -p $PID > /dev/null; then
  echo "Stopping application with PID: $PID"
  kill $PID
  rm server.pid
  echo "Application stopped"
else
  echo "Process with PID $PID is not running. Removing stale PID file."
  rm server.pid
fi
EOF

# Make scripts executable
chmod +x $DEPLOY_DIR/start.sh
chmod +x $DEPLOY_DIR/stop.sh

# Create a simple README for deployment
cat > $DEPLOY_DIR/README.md << EOF
# IndoQuran Deployment

This is a simplified deployment of the IndoQuran application.

## Running the server

### Using simple scripts

To start the server:
\`\`\`bash
./start.sh
\`\`\`

To stop the server:
\`\`\`bash
./stop.sh
\`\`\`

### Manual start

Alternatively, you can start the server manually:
\`\`\`bash
npm install --production
NODE_ENV=production node server.js
\`\`\`

## Notes

- Logs will be written to the logs/ directory
- The server will automatically create a server.pid file to track the process
- The server will automatically load environment variables from .env.production
EOF

echo "Deployment files ready in $DEPLOY_DIR"
echo "To deploy to production server:"
echo "1. Copy the contents of $DEPLOY_DIR to your production server"
echo "2. Run 'npm install --production' on the server"
echo "3. Run 'NODE_ENV=production node server.js' to start the application"
