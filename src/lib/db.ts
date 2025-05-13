import mysql from 'mysql2/promise';
import { getEnv } from '@/utils/env'; 
import logger from '@/utils/logger';

// Connection pool configuration
const poolConfig = {
  host: getEnv('DB_HOST', 'localhost'),
  user: getEnv('DB_USER', 'root'),
  password: getEnv('DB_PASSWORD', 'root'),
  database: getEnv('DB_NAME', 'indoquran_db'),
  port: parseInt(getEnv('DB_PORT', '3306')),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create MySQL connection pool
const pool = mysql.createPool(poolConfig);

// Log connection pool creation
logger.info('MySQL connection pool created', { connectionLimit: poolConfig.connectionLimit });

// Export the pool as db
export const db = pool;
