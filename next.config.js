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
  
  // Experimental features configuration
  experimental: {
    // Optimize CSS output
    optimizeCss: true,
    // Configure server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Image optimization
  images: {
    domains: ['indoquran.web.id'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Static optimization
  staticPageGenerationTimeout: 120,
  compress: true,
  poweredByHeader: false,
  
  // Cache optimization
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 hour
    pagesBufferLength: 5,
  },

  // Improve page loading
  reactStrictMode: true,
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
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