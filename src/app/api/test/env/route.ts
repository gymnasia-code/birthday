import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  return NextResponse.json({
    hasNotionSecret: !!process.env.NOTION_SECRET,
    hasNotionDatabaseId: !!process.env.NOTION_DATABASE_ID,
    hasPosterToken: !!process.env.POSTER_TOKEN,
    hasPosterTokenCafe: !!process.env.POSTER_TOKEN_CAFE,
    hasPosterTokenPark: !!process.env.POSTER_TOKEN_PARK,
    hasPosterApiUrl: !!process.env.POSTER_API_URL,
    hasSlackWebhookUrl: !!process.env.SLACK_WEBHOOK_URL,
    notionDatabaseId: process.env.NOTION_DATABASE_ID,
    posterApiUrl: process.env.POSTER_API_URL,
    posterBaseUrlCafe: process.env.POSTER_BASE_URL_CAFE,
    posterBaseUrlPark: process.env.POSTER_BASE_URL_PARK,
    nextPublicBaseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    nodeEnv: process.env.NODE_ENV,
    // Don't expose the actual secrets, just whether they exist
    envStatus: 'checked',
  })
}
