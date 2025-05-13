import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import logger from "@/utils/logger";

// Set Node.js runtime for this file too
export const runtime = 'nodejs';

/**
 * Get a user by their email address
 */
export async function getUserByEmail(email: string) {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
  });

  try {
    const query = 'SELECT * FROM users WHERE email = ?';
    logger.debug(query, [email]);
    
    const [rows]: [any[], any] = await conn.execute(query, [email]);
    await conn.end();
    
    logger.info('User lookup by email completed', { found: !!rows[0] });
    return rows[0] as any;
  } catch (error) {
    logger.error('Database query error in getUserByEmail:', { email, error });
    await conn.end();
    return null;
  }
}

/**
 * Create a new user
 */
export async function createUser(userData: { 
  name: string; 
  email: string; 
  password?: string; 
  provider?: string 
}) {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
  });

  try {
    const user_id = uuidv4();
    const hashedPassword = userData.password ? await bcrypt.hash(userData.password, 10) : null;
    
    const insertQuery = 'INSERT INTO users (user_id, username, email, password, provider) VALUES (?, ?, ?, ?, ?)';
    const insertParams = [user_id, userData.name, userData.email, hashedPassword || '', userData.provider || 'credentials'];
    
    logger.debug(insertQuery, insertParams);
    await conn.execute(insertQuery, insertParams);
    
    const selectQuery = 'SELECT * FROM users WHERE user_id = ?';
    logger.debug(selectQuery, [user_id]);
    
    const [rows]: [any[], any] = await conn.execute(selectQuery, [user_id]);
    
    await conn.end();
    logger.info('New user created', { userId: user_id, email: userData.email });
    return rows[0] as any;
  } catch (error) {
    logger.error('Database query error in createUser:', { userData: { ...userData, password: '[REDACTED]' }, error });
    await conn.end();
    return null;
  }
}