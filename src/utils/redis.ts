'use server';

import Redis, { RedisOptions } from 'ioredis';
import { getEnv } from './env';

let redisInstance: Redis | null = null;
// This variable is used to track Redis connection state
let isRedisConnecting = false;
let isRedisReady = false;

// Initialize Redis client (not exported)
function initRedisClient(): Redis {
  if (typeof window !== 'undefined') {
    throw new Error('Redis client cannot be used on the client side');
  }
  
  if (!redisInstance) {
    // Environment variables are loaded from the centralized utility in env.ts
    const redisUrl = getEnv('REDIS_URL', 'redis://localhost:6379');
    const redisPassword = getEnv('REDIS_PASSWORD', '');
    
    const options: RedisOptions = {
      enableOfflineQueue: true, // Changed to true to queue commands when disconnected
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        // Exponential backoff with max 3000ms
        return Math.min(times * 200, 3000);
      },
      connectTimeout: 10000, // 10 seconds
      reconnectOnError: (err) => {
        // Reconnect for specific errors that might be temporary
        const targetError = err.message.slice(0, 'READONLY'.length) === 'READONLY';
        return targetError ? 1 : false;
      }
    };
    
    if (redisPassword) {
      options.password = redisPassword;
    }
    
    isRedisConnecting = true;
    isRedisReady = false;
    redisInstance = new Redis(redisUrl, options);
    
    redisInstance.on('error', (error) => {
      console.error('Redis client error:', error);
      isRedisReady = false;
      // Don't crash the app on Redis connection errors
    });
    
    redisInstance.on('connect', () => {
      isRedisConnecting = false;
      console.log('Redis client connected successfully');
    });

    redisInstance.on('ready', () => {
      isRedisReady = true;
      console.log('Redis client ready to accept commands');
    });

    // Handle process exit - clean up Redis connection
    if (typeof process !== 'undefined') {
      ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
        process.once(signal, () => {
          if (redisInstance) {
            redisInstance.quit().catch((err) => {
              console.error('Error closing Redis connection:', err);
            });
          }
        });
      });
    }
  }
  
  return redisInstance;
}

export async function getCache<T>(key: string): Promise<T | null> {
  if (typeof window !== 'undefined') {
    console.warn('Redis getCache called on client side, returning null');
    return null;
  }
  
  try {
    const redis = initRedisClient();
    
    // Wait for Redis to be ready before proceeding
    if (!isRedisReady) {
      await waitForRedisReady(redis);
    }
    
    const cachedData = await redis.get(key);
    
    if (!cachedData) {
      return null;
    }
    
    return JSON.parse(cachedData) as T;
  } catch (error) {
    console.error('Redis get cache error:', error);
    return null;
  }
}

// Helper function to wait for Redis to be ready
async function waitForRedisReady(redis: Redis): Promise<void> {
  if (isRedisReady) return;
  
  // Use a timeout to avoid hanging indefinitely
  const timeout = 5000; // 5 seconds
  const interval = 100; // Check every 100ms
  let elapsed = 0;
  
  return new Promise((resolve, reject) => {
    const checkReady = async () => {
      if (isRedisReady) {
        return resolve();
      }
      
      // Try ping to check connection
      try {
        await redis.ping();
        isRedisReady = true;
        return resolve();
      } catch (_) {
        // Ignore error and continue waiting
      }
      
      elapsed += interval;
      if (elapsed >= timeout) {
        return reject(new Error('Redis connection timeout'));
      }
      
      setTimeout(checkReady, interval);
    };
    
    checkReady();
  });
}

export async function setCache<T>(key: string, data: T): Promise<void> {
  if (typeof window !== 'undefined') {
    console.warn('Redis setCache called on client side, operation skipped');
    return;
  }
  
  try {
    const redis = initRedisClient();
    
    // Wait for Redis to be ready before proceeding
    if (!isRedisReady) {
      try {
        await waitForRedisReady(redis);
      } catch (timeoutErr) {
        // If we timeout waiting for Redis, log it but don't crash
        console.warn('Redis not ready, skipping cache operation:', timeoutErr);
        return;
      }
    }
    
    // Check if the redis connection is still valid
    const isConnected = redis.status === 'ready';
    if (!isConnected) {
      console.warn('Redis connection not ready, skipping cache operation');
      return;
    }
    
    await redis.set(key, JSON.stringify(data));
  } catch (error) {
    console.error('Redis set cache error:', error);
    // Don't rethrow - we don't want Redis errors to break the app
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  if (typeof window !== 'undefined') {
    console.warn('Redis invalidateCache called on client side, operation skipped');
    return;
  }
  
  try {
    const redis = initRedisClient();
    
    // Wait for Redis to be ready before proceeding
    if (!isRedisReady) {
      try {
        await waitForRedisReady(redis);
      } catch (timeoutErr) {
        console.warn('Redis not ready, skipping invalidation operation:', timeoutErr);
        return;
      }
    }
    
    // Check if the redis connection is still valid
    const isConnected = redis.status === 'ready';
    if (!isConnected) {
      console.warn('Redis connection not ready, skipping invalidation operation');
      return;
    }
    
    // Get keys matching pattern
    const keys = await redis.keys(pattern);
    
    if (keys.length > 0) {
      console.log(`Invalidating ${keys.length} cache keys for pattern: ${pattern}`);
      
      // Handle the case where there might be many keys
      // Redis has a limit on arguments, so we chunk the deletion if needed
      if (keys.length <= 100) {
        await redis.del(...keys);
      } else {
        // Process in batches of 100
        for (let i = 0; i < keys.length; i += 100) {
          const batch = keys.slice(i, i + 100);
          await redis.del(...batch);
        }
      }
    }
  } catch (error) {
    console.error('Redis invalidate cache error:', error);
    // Don't rethrow - we don't want Redis errors to break the app
  }
}

/**
 * Gets data from cache if it exists, otherwise fetches it from the API,
 * stores it in cache, and returns the fetched data
 * @param key - The cache key to check
 * @param fetchFn - Function that fetches data from API if cache miss
 * @param ttl - Time to live in seconds (optional, default: no expiration)
 * @returns The data from cache or API
 */
export async function getOrFetchCache<T>(
  key: string, 
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  if (typeof window !== 'undefined') {
    console.warn('Redis getOrFetchCache called on client side, falling back to direct fetch');
    return fetchFn();
  }
  
  try {
    // Try to get from cache first, but don't fail if Redis is unavailable
    let cachedData = null;
    try {
      cachedData = await getCache<T>(key);
    } catch (cacheError) {
      console.warn(`Failed to get data from cache for key ${key}:`, cacheError);
      // Continue with the function - we'll fall back to direct fetch
    }
    
    // If found in cache, return it
    if (cachedData) {
      return cachedData;
    }
    
    // Otherwise fetch fresh data
    const freshData = await fetchFn();
    
    // Try to store in cache, but don't fail if Redis is unavailable
    try {
      // Store in cache (with optional TTL)
      if (ttl) {
        const redis = initRedisClient();
        
        // Make sure Redis is ready
        if (isRedisReady) {
          await redis.set(key, JSON.stringify(freshData), 'EX', ttl);
        }
      } else {
        await setCache(key, freshData);
      }
    } catch (cacheSetError) {
      console.warn(`Failed to store data in cache for key ${key}:`, cacheSetError);
      // Continue with the function - we already have the fresh data
    }
    
    return freshData;
  } catch (error) {
    console.error('Cache/fetch error:', error);
    // If everything fails, fall back to direct API call
    return fetchFn();
  }
}

// New function to check if Redis is available
export async function isRedisAvailable(): Promise<boolean> {
  if (typeof window !== 'undefined') {
    console.warn('Redis check called on client side, returning false');
    return false;
  }
  
  try {
    const redis = initRedisClient();
    
    // If Redis is already ready, return true
    if (isRedisReady) {
      return true;
    }
    
    // Try to wait for Redis to become ready
    try {
      await waitForRedisReady(redis);
      return true;
    } catch (timeoutErr) {
      console.warn('Redis availability check failed:', timeoutErr);
      return false;
    }
  } catch (error) {
    console.error('Redis availability check error:', error);
    return false;
  }
}
