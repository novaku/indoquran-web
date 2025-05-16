// Load environment variables from deploy directory
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Try to load environment variables from root directory first, then deploy directory
const rootEnvPath = path.resolve(process.cwd(), '.env.local');
const deployEnvPath = path.resolve(process.cwd(), 'deploy', '.env.local');

if (fs.existsSync(rootEnvPath)) {
  console.log(`Loading environment from root: ${rootEnvPath}`);
  dotenv.config({ path: rootEnvPath });
} else if (fs.existsSync(deployEnvPath)) {
  console.log(`Loading environment from deploy directory: ${deployEnvPath}`);
  dotenv.config({ path: deployEnvPath });
} else {
  console.warn('No .env.local found in root or deploy directory');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Core configuration
  serverExternalPackages: ['mysql2', 'ioredis', 'bcryptjs'], // External packages that need to be bundled
  
  // Explicitly mark modules that should be treated as external (server-only)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'tls', 'fs', etc. on the client to prevent issues
      config.resolve.fallback = {
        ...config.resolve.fallback,
        tls: false,
        fs: false,
        net: false,
        path: false,
        mysql: false,
        mysql2: false,
      };
    }
    return config;
  },
  
  // Output as standalone for Docker deployment
  output: 'standalone',
  
  // Improve reliability for API routes
  experimental: {
    serverActions: {
      // Improves server actions reliability
      allowedOrigins: ['localhost:3000', 'indoquran.vercel.app'],
    },
    // Enable optimizations
    optimizeCss: true,
    scrollRestoration: true,
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.quran.gading.dev',
        pathname: '**',
      },
    ],
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  
  // Performance optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Enable built-in React 18 optimizations
  reactStrictMode: true,
  
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