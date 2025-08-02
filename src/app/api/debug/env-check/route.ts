import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  // Block debug endpoints in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoints are not available in production' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    timestamp: new Date().toISOString(),
  })
}
