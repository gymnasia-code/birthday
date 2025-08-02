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

  try {
    // Check all Poster-related environment variables
    const posterToken = process.env.POSTER_TOKEN
    const posterTokenCafe = process.env.POSTER_TOKEN_CAFE
    const posterTokenPark = process.env.POSTER_TOKEN_PARK

    // Get previews (first 10 chars) to verify tokens are being read
    const tokenPreview = posterToken
      ? `${posterToken.substring(0, 10)}...`
      : 'NOT_FOUND'
    const cafeTokenPreview = posterTokenCafe
      ? `${posterTokenCafe.substring(0, 10)}...`
      : 'NOT_FOUND'
    const parkTokenPreview = posterTokenPark
      ? `${posterTokenPark.substring(0, 10)}...`
      : 'NOT_FOUND'

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,

      // Main token
      hasPosterToken: !!posterToken,
      posterTokenLength: posterToken?.length || 0,
      posterTokenPreview: tokenPreview,

      // Cafe token
      hasPosterTokenCafe: !!posterTokenCafe,
      posterTokenCafeLength: posterTokenCafe?.length || 0,
      posterTokenCafePreview: cafeTokenPreview,

      // Park token
      hasPosterTokenPark: !!posterTokenPark,
      posterTokenParkLength: posterTokenPark?.length || 0,
      posterTokenParkPreview: parkTokenPreview,

      // URLs
      posterApiUrl: process.env.POSTER_API_URL,
      posterBaseUrlCafe: process.env.POSTER_BASE_URL_CAFE,
      posterBaseUrlPark: process.env.POSTER_BASE_URL_PARK,

      // Runtime info
      runtime: 'edge',

      // All env keys that start with POSTER_
      posterEnvKeys: Object.keys(process.env).filter(key =>
        key.startsWith('POSTER_')
      ),

      success: true,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Debug check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
      { status: 500 }
    )
  }
}
