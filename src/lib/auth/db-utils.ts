import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

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
    const [rows]: [any[], any] = await conn.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    await conn.end();
    return rows[0] as any;
  } catch (error) {
    console.error('Database query error:', error);
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
    
    await conn.execute(
      'INSERT INTO users (user_id, username, email, password, provider) VALUES (?, ?, ?, ?, ?)',
      [user_id, userData.name, userData.email, hashedPassword || '', userData.provider || 'credentials']
    );
    
    const [rows]: [any[], any] = await conn.execute(
      'SELECT * FROM users WHERE user_id = ?',
      [user_id]
    );
    
    await conn.end();
    return rows[0] as any;
  } catch (error) {
    console.error('Database query error:', error);
    await conn.end();
    return null;
  }
}