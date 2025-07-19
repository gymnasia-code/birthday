import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  try {
    const params = await context.params
    const [programName, sceneName] = params.slug

    if (!programName || !sceneName) {
      return NextResponse.json(
        { error: 'Missing program name or scene name' },
        { status: 400 }
      )
    }

    // In a real implementation, you would load this from a file or database
    const mockScene = {
      id: sceneName,
      name: sceneName.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      message: `Scene data for ${programName}/${sceneName}`,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(mockScene)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
