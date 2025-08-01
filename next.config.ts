import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev'
import type { NextConfig } from 'next'
import path from 'path'

// Setup development platform for Cloudflare compatibility
if (process.env.NODE_ENV === 'development') {
  setupDevPlatform()
}

const nextConfig: NextConfig = {
  // Configuration for Cloudflare Pages
  typescript: {
    // Allow builds to proceed even with TypeScript errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow builds to proceed even with ESLint errors
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gymnasiacafe.joinposter.com',
        port: '',
        pathname: '/upload/**',
      },
      {
        protocol: 'https',
        hostname: 'gymnasia.joinposter.com',
        port: '',
        pathname: '/upload/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Exclude problematic directories from webpack compilation
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/chrome-profile/**',
        '~/Projects/chrome-profile/**',
        '**/SingletonSocket',
        '**/SingletonLock',
        '**/SingletonCookie',
      ],
    }

    // Exclude symlink-prone patterns from resolution and add path aliases
    config.resolve = {
      ...config.resolve,
      symlinks: false,
      alias: {
        ...config.resolve.alias,
        '@': path.resolve(process.cwd(), 'src'),
      },
    }

    return config
  },
}

export default nextConfig
