// Load environment variables from deploy directory
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Try to load environment variables from deploy directory
const envPath = path.resolve(process.cwd(), 'deploy', '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from: ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.warn('No .env.local found in deploy directory');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Core configuration
  serverExternalPackages: ['mysql2', 'ioredis', 'bcryptjs'], // External packages that need to be bundled
  
  // Output as standalone for Docker deployment
  output: 'standalone',
  
  // Improve reliability for API routes
  experimental: {
    serverActions: {
      // Improves server actions reliability
      allowedOrigins: ['localhost:3000', 'indoquran.vercel.app'],
    }
  },
  
  // Configure headers for better security
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
      ],
    },
  ],
}

module.exports = nextConfig