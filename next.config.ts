import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  devIndicators: false,
  // Server-side environment variables
  serverRuntimeConfig: {
    // Variables only available on server-side
    REDIS_URL: process.env.REDIS_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET
  },
  // Public environment variables (available on both client and server)
  publicRuntimeConfig: {
    // Variables available in both client and server
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL
  },
  // Webpack configuration to handle Node.js modules
  webpack: (config, { isServer }) => {
    // Only include node modules in server-side builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        dns: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Additional Next.js configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.quran.gading.dev',
        pathname: '**',
      },
    ],
  },
  // Add this section to specify Node.js packages for server components
  experimental: {
    // List packages that should be treated as external dependencies for server components
    serverComponentsExternalPackages: ['some-node-package'],
  },
};

export default nextConfig;
