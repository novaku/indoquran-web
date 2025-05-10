import { query } from '@/utils/db';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';

export interface User {
  user_id: string;
  username: string;
  email: string;
  provider?: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

export interface UserInput {
  username: string;
  email: string;
  password: string;
}

export interface OAuthUserInput {
  name: string;
  email: string;
  provider: string;
  image?: string;
}

export const userService = {
  async createUser(userData: UserInput): Promise<User> {
    const user_id = uuidv4();
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const result = await query({
      query: `
        INSERT INTO users (user_id, username, email, password)
        VALUES (?, ?, ?, ?)
      `,
      values: [user_id, userData.username, userData.email, hashedPassword]
    });
    
    return this.getUserById(user_id) as Promise<User>;
  },
  
  async getUserById(userId: string): Promise<User | null> {
    const users = await query({
      query: 'SELECT user_id, username, email, created_at, updated_at FROM users WHERE user_id = ?',
      values: [userId]
    }) as User[];
    
    return users.length > 0 ? users[0] : null;
  },
  
  async getUserByEmail(email: string): Promise<User | null> {
    const users = await query({
      query: 'SELECT user_id, username, email, provider, image, created_at, updated_at FROM users WHERE email = ?',
      values: [email]
    }) as User[];
    
    return users.length > 0 ? users[0] : null;
  },
  
  async findOrCreateOAuthUser(userData: OAuthUserInput): Promise<User> {
    // First, check if user exists by email
    const existingUser = await this.getUserByEmail(userData.email);
    
    if (existingUser) {
      // If user exists but was created with different provider, update the provider
      if (existingUser.provider !== userData.provider) {
        await query({
          query: 'UPDATE users SET provider = ?, image = ? WHERE user_id = ?',
          values: [userData.provider, userData.image || null, existingUser.user_id]
        });
      }
      return existingUser;
    }
    
    // If user doesn't exist, create new user
    const user_id = uuidv4();
    await query({
      query: `
        INSERT INTO users (user_id, username, email, password, provider, image)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      values: [
        user_id, 
        userData.name, 
        userData.email, 
        '', // Empty password for OAuth users
        userData.provider,
        userData.image || null
      ]
    });
    
    return this.getUserById(user_id) as Promise<User>;
  },
  
  async verifyCredentials(email: string, password: string): Promise<User | null> {
    const users = await query({
      query: 'SELECT * FROM users WHERE email = ?',
      values: [email]
    }) as any[];
    
    if (users.length === 0) {
      return null;
    }
    
    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return null;
    }
    
    // Remove password before returning user
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }
};
