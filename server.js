const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs');

// Load environment variables based on NODE_ENV
// We'll try both the direct approach and a more thorough search
const isProduction = process.env.NODE_ENV === 'production';
const envFileName = isProduction ? '.env.production' : '.env.local';

// Try different possible locations for the env file
const possiblePaths = [
  path.resolve(process.cwd(), 'deploy', envFileName),
  path.resolve(process.cwd(), envFileName),
  path.resolve(process.cwd(), '..', 'deploy', envFileName)
];

// Find the first path that exists
const envPath = possiblePaths.find(p => fs.existsSync(p));

if (envPath) {
  console.log(`Server loading environment from: ${envPath}`);
  require('dotenv').config({ path: envPath });
} else {
  console.warn(`Environment file ${envFileName} not found in any of the expected locations.`);
  console.warn('Using default environment variables or those from the system.');
}

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('Created logs directory');
  } catch (error) {
    console.warn('Could not create logs directory:', error.message);
  }
}

// Setup log file for production
const logFile = path.join(logsDir, 'server.log');
if (isProduction) {
  // Redirect console output to log file in production
  const logStream = fs.createWriteStream(logFile, { flags: 'a' });
  
  // Store original console methods
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  // Override console methods to also write to log file
  console.log = function() {
    const args = Array.from(arguments);
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] [INFO] ${args.join(' ')}`;
    logStream.write(message + '\n');
    originalConsoleLog.apply(console, arguments);
  };
  
  console.error = function() {
    const args = Array.from(arguments);
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] [ERROR] ${args.join(' ')}`;
    logStream.write(message + '\n');
    originalConsoleError.apply(console, arguments);
  };
  
  console.warn = function() {
    const args = Array.from(arguments);
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] [WARN] ${args.join(' ')}`;
    logStream.write(message + '\n');
    originalConsoleWarn.apply(console, arguments);
  };
  
  // Log server start
  console.log('Server starting in production mode');
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

// Create the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Process management for production mode
if (isProduction) {
  // Handle graceful shutdown
  const handleShutdown = () => {
    console.log('Server shutting down...');
    process.exit(0);
  };

  // Handle signals
  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    // Keep the process running despite the error
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Keep the process running despite the error
  });
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      // Add basic request logging
      const start = Date.now();
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const method = req.method;
      const url = req.url;
      
      // Add CORS headers if needed
      if (isProduction) {
        res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }
      }
      
      // Parse the URL
      const parsedUrl = parse(url, true);
      const { pathname, query } = parsedUrl;

      // Let Next.js handle the request
      await handle(req, res, parsedUrl);
      
      // Log request completion
      const duration = Date.now() - start;
      console.log(`${method} ${url} - ${res.statusCode} - ${duration}ms - ${ip}`);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });
  
  // Add error handler for the server
  server.on('error', (e) => {
    console.error('Server error:', e);
    if (e.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Trying again in 5 seconds...`);
      setTimeout(() => {
        server.close();
        server.listen(port, hostname);
      }, 5000);
    }
  });

  server.listen(port, hostname, (err) => {
    if (err) throw err;
    
    // Print server info
    const serverUrl = `http://${hostname}:${port}`;
    console.log(`> Ready on ${serverUrl}`);
    console.log(`> Environment: ${isProduction ? 'production' : 'development'}`);
    console.log(`> Date: ${new Date().toISOString()}`);
    
    // Create a file to indicate the server is running (can be used for monitoring)
    if (isProduction) {
      const pidFile = path.join(process.cwd(), 'server.pid');
      fs.writeFileSync(pidFile, process.pid.toString());
      console.log(`> PID: ${process.pid} (saved to server.pid)`);
    }
  });
});
