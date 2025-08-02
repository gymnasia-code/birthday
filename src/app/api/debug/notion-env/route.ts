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
    // Check specific environment variables that might be causing issues
    const notionSecret = process.env.NOTION_SECRET
    const notionDatabaseId = process.env.NOTION_DATABASE_ID

    // Get the first few characters of the secret to verify it's being read correctly
    const secretPreview = notionSecret
      ? `${notionSecret.substring(0, 10)}...`
      : 'NOT_FOUND'

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,

      // Environment variable checks
      hasNotionSecret: !!notionSecret,
      notionSecretLength: notionSecret?.length || 0,
      notionSecretPreview: secretPreview,
      notionSecretType: typeof notionSecret,

      hasNotionDatabaseId: !!notionDatabaseId,
      notionDatabaseId,

      // Check if the secret follows expected format (Notion secrets start with 'secret_')
      secretFormatValid: notionSecret?.startsWith('secret_') || false,

      // Runtime info
      runtime: 'edge',

      // All env keys that start with NOTION_
      notionEnvKeys: Object.keys(process.env).filter(key =>
        key.startsWith('NOTION_')
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
