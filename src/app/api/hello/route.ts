import { NextResponse } from 'next/server'

// Specify Edge Runtime for Cloudflare compatibility
export const runtime = 'edge'

export async function GET() {
  console.log('API request received at /api/hello')
  return NextResponse.json({
    message: 'Hello from Cloudflare Edge!',
    timestamp: new Date().toISOString(),
  })
}
