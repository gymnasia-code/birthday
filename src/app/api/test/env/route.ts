import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  return NextResponse.json({
    hasNotionSecret: !!process.env.NOTION_SECRET,
    hasNotionDatabaseId: !!process.env.NOTION_DATABASE_ID,
    hasPosterToken: !!process.env.POSTER_TOKEN,
    hasPosterApiUrl: !!process.env.POSTER_API_URL,
    notionDatabaseId: process.env.NOTION_DATABASE_ID,
    posterApiUrl: process.env.POSTER_API_URL,
    // Don't expose the actual secrets, just whether they exist
    envStatus: 'checked',
  })
}
