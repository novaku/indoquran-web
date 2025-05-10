'use server';

import Redis from 'ioredis';

let redisInstance: Redis | null = null;

// Initialize Redis client (not exported)
function initRedisClient(): Redis {
  if (typeof window !== 'undefined') {
    throw new Error('Redis client cannot be used on the client side');
  }
  
  if (!redisInstance) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisInstance = new Redis(redisUrl, {
      enableOfflineQueue: false,
      maxRetriesPerRequest: 3,
    });
    
    redisInstance.on('error', (error) => {
      console.error('Redis client error:', error);
      // Don't crash the app on Redis connection errors
    });
    
    redisInstance.on('connect', () => {
      console.log('Redis client connected successfully');
    });
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

export async function setCache(key: string, data: any): Promise<void> {
  if (typeof window !== 'undefined') {
    console.warn('Redis setCache called on client side, operation skipped');
    return;
  }
  
  try {
    const redis = initRedisClient();
    await redis.set(key, JSON.stringify(data));
  } catch (error) {
    console.error('Redis set cache error:', error);
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  if (typeof window !== 'undefined') {
    console.warn('Redis invalidateCache called on client side, operation skipped');
    return;
  }
  
  try {
    const redis = initRedisClient();
    const keys = await redis.keys(pattern);
    
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Redis invalidate cache error:', error);
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
    // Try to get from cache first
    const cachedData = await getCache<T>(key);
    
    // If found in cache, return it
    if (cachedData) {
      return cachedData;
    }
    
    // Otherwise fetch fresh data
    const freshData = await fetchFn();
    
    // Store in cache (with optional TTL)
    if (ttl) {
      const redis = initRedisClient();
      await redis.set(key, JSON.stringify(freshData), 'EX', ttl);
    } else {
      await setCache(key, freshData);
    }
    
    return freshData;
  } catch (error) {
    console.error('Cache/fetch error:', error);
    // If everything fails, fall back to direct API call
    return fetchFn();
  }
}
