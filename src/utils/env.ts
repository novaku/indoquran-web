import path from 'path';
import { existsSync } from 'fs';
import dotenv from 'dotenv';

/**
 * Utility function to load environment variables from the deploy directory
 */
export function loadEnvFromDeployDir(): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const envFileName = isProduction ? '.env.production' : '.env.local';
  
  // Try different possible locations for the env file
  const possiblePaths = [
    path.resolve(process.cwd(), 'deploy', envFileName),
    path.resolve(process.cwd(), envFileName),
    path.resolve(process.cwd(), '..', 'deploy', envFileName)
  ];
  
  // Find the first path that exists
  const envPath = possiblePaths.find(p => existsSync(p));
  
  if (envPath) {
    console.log(`Loading environment from: ${envPath}`);
    dotenv.config({ path: envPath });
  } else {
    console.warn(`Environment file ${envFileName} not found in any of the expected locations.`);
    console.warn('Using default environment variables or those from the system.');
  }
}

// Load environment variables immediately when this module is imported
loadEnvFromDeployDir();

/**
 * Utility function to get environment variable with a default fallback
 */
export function getEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}
