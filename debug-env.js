// Debug script to check environment variable loading
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

console.log('Starting environment check script...');

// Load environment variables
function loadEnvFromDeployDir() {
  const isProduction = process.env.NODE_ENV === 'production';
  const envFileName = isProduction ? '.env.production' : '.env.local';
  
  // Try different possible locations for the env file
  const possiblePaths = [
    path.resolve(process.cwd(), 'deploy', envFileName),
    path.resolve(process.cwd(), envFileName),
    path.resolve(process.cwd(), '..', 'deploy', envFileName)
  ];
  
  // Show all paths being checked
  console.log('Checking for environment files:');
  possiblePaths.forEach(p => {
    const exists = fs.existsSync(p);
    console.log(`${p} - ${exists ? 'EXISTS' : 'NOT FOUND'}`);
  });
  
  // Find the first path that exists
  const envPath = possiblePaths.find(p => fs.existsSync(p));
  
  if (envPath) {
    console.log(`Loading environment from: ${envPath}`);
    dotenv.config({ path: envPath });
    
    // Show loaded variables (redacting sensitive info)
    console.log('\nLoaded environment variables:');
    const hiddenVars = ['NEXTAUTH_SECRET', 'DB_PASSWORD', 'REDIS_PASSWORD'];
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('NEXT') || key.startsWith('REDIS') || key.startsWith('DB_')) {
        const value = hiddenVars.includes(key) ? '******' : process.env[key];
        console.log(`${key}: ${value}`);
      }
    });
  } else {
    console.error(`Environment file ${envFileName} not found in any of the expected locations.`);
  }
}

loadEnvFromDeployDir();
