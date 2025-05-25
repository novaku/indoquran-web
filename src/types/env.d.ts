// This file extends the NodeJS namespace to include all our environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    // API Configuration
    NEXT_PUBLIC_API_BASE_URL: string;
    
    // Redis Configuration
    REDIS_URL?: string;
    REDIS_SOCKET_PATH?: string;
    REDIS_PASSWORD?: string;
    
    // Database Configuration
    DATABASE_URL: string;
    DB_HOST: string;
    DB_PORT: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    
    // Next Auth Configuration
    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    FACEBOOK_CLIENT_ID: string;
    FACEBOOK_CLIENT_SECRET: string;
    
    // Application Settings
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
