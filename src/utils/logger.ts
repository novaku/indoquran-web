import fs from 'fs';
import path from 'path';
import { getEnv } from './env';

// Define log level types
type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

// Logger configuration - can be adjusted via environment variables
const LOG_TO_CONSOLE = getEnv('LOG_TO_CONSOLE', 'true') === 'true';
const LOG_TO_FILE = getEnv('LOG_TO_FILE', 'false') === 'true';
const LOG_LEVEL = getEnv('LOG_LEVEL', 'INFO');
const LOG_FILE_PATH = getEnv('LOG_FILE_PATH', './logs');
const LOG_FILENAME = getEnv('LOG_FILENAME', 'indoquran.log');

// Ensure log directory exists
if (LOG_TO_FILE) {
  try {
    fs.mkdirSync(LOG_FILE_PATH, { recursive: true });
  } catch (error) {
    console.error('Failed to create log directory:', error);
  }
}

// Format timestamp for logs
const formatTimestamp = () => {
  const now = new Date();
  return now.toISOString();
};

// Write log to file
const writeToFile = (logEntry: string, filename: string) => {
  if (!LOG_TO_FILE) return;
  
  const filePath = path.join(LOG_FILE_PATH, filename);
  fs.appendFileSync(filePath, logEntry + '\n');
};

// Internal logging function
const log = (level: LogLevel, message: string, data?: any) => {
  // Skip logging if level is below configured level
  const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
  const configuredLevelIndex = levels.indexOf(LOG_LEVEL);
  const currentLevelIndex = levels.indexOf(level);
  
  if (currentLevelIndex < configuredLevelIndex) {
    return;
  }

  const timestamp = formatTimestamp();
  const dataString = data ? JSON.stringify(data, null, 2) : '';
  const logEntry = `[${timestamp}] [${level}] ${message} ${dataString}`.trim();
  
  // Log to console if enabled
  if (LOG_TO_CONSOLE) {
    switch (level) {
      case 'ERROR':
        console.error(logEntry);
        break;
      case 'WARN':
        console.warn(logEntry);
        break;
      case 'DEBUG':
        console.debug(logEntry);
        break;
      default:
        console.log(logEntry);
    }
  }
  
  // Write to file if enabled
  if (LOG_TO_FILE) {
    writeToFile(logEntry, LOG_FILENAME);
  }
};

// Public logging API
export const logger = {
  debug: (message: string, data?: any) => log('DEBUG', message, data),
  info: (message: string, data?: any) => log('INFO', message, data),
  warn: (message: string, data?: any) => log('WARN', message, data),
  error: (message: string, data?: any) => log('ERROR', message, data)
};

export default logger;
