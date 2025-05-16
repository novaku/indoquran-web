import 'server-only'; // This ensures this module is never used on the client side
import mysql from 'mysql2/promise';
import { getEnv } from '@/utils/env'; 
import logger from '@/utils/logger';
import fs from 'fs';
import path from 'path';

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

// SQL Query logging function
const logQuery = (query: string, params?: any[]) => {
  const timestamp = new Date().toISOString();
  const formattedQuery = params 
    ? `[${timestamp}] ${query} -- Params: ${JSON.stringify(params)}` 
    : `[${timestamp}] ${query}`;
  
  // Log to console
  logger.debug('MySQL Query', { query, params });
  
  // Append to the SQL log file
  try {
    fs.appendFileSync(
      path.join(process.cwd(), 'logs', 'mysql_queries.log'), 
      formattedQuery + '\n\n', 
      'utf8'
    );
  } catch (err) {
    logger.error('Failed to write to SQL log file', err);
  }
};

// Create a modified pool with query logging
const originalPool = mysql.createPool(poolConfig);

// Create wrapper for the pool to log queries
const pool = {
  ...originalPool,
  execute: async (sql: string, values?: any) => {
    logQuery(sql, values);
    return originalPool.execute(sql, values);
  },
  query: async (sql: string, values?: any) => {
    logQuery(sql, values);
    return originalPool.query(sql, values);
  }
};

// Log connection pool creation
logger.info('MySQL connection pool created with query logging enabled', { connectionLimit: poolConfig.connectionLimit });

// Export the pool as db
export const db = pool as mysql.Pool;
