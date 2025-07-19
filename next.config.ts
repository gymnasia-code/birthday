import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev'
import type { NextConfig } from 'next'

// Setup development platform for Cloudflare compatibility
if (process.env.NODE_ENV === 'development') {
  setupDevPlatform()
}

const nextConfig: NextConfig = {
  // Configuration for Cloudflare Pages
}

export default nextConfig
