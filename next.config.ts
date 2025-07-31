import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev'
import type { NextConfig } from 'next'

// Setup development platform for Cloudflare compatibility
if (process.env.NODE_ENV === 'development') {
  setupDevPlatform()
}

const nextConfig: NextConfig = {
  // Configuration for Cloudflare Pages
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

    // Exclude symlink-prone patterns from resolution
    config.resolve = {
      ...config.resolve,
      symlinks: false,
    }

    return config
  },
}

export default nextConfig
