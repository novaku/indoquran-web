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

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

// Create the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Parse the URL
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;

      // Let Next.js handle the request
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
