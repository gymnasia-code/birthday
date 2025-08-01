import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import { logger } from '@/lib/utils/logger'

export const runtime = 'edge'

export async function GET() {
  try {
    logger.serverInfo('Testing Notion connection')

    const notionToken = process.env.NOTION_SECRET
    const notionDatabaseId =
      process.env.NOTION_DATABASE_ID || '7c2bd07e-8bce-4a01-be92-531874f8c760'

    logger.serverDebug('Environment check', {
      hasNotionToken: !!notionToken,
      notionDatabaseId,
    })

    if (!notionToken) {
      return NextResponse.json(
        {
          error: 'NOTION_SECRET environment variable is missing',
          success: false,
        },
        { status: 500 }
      )
    }

    const notion = new Client({ auth: notionToken })

    // Test by querying the database (just get first few records)
    logger.serverDebug('Querying Notion database')
    const response = await notion.databases.query({
      database_id: notionDatabaseId,
      page_size: 2,
      filter: {
        property: 'Type',
        select: {
          equals: 'Birthday',
        },
      },
    })

    logger.serverInfo('Notion query successful', {
      resultsCount: response.results.length,
    })

    const results = response.results.map((record: unknown) => {
      const recordData = record as {
        id: string
        properties: Record<string, any>
      }

      return {
        id: recordData.id,
        properties: Object.keys(recordData.properties || {}),
        uniqueId:
          recordData.properties?.ID?.unique_id?.number ||
          recordData.properties?.iD?.unique_id?.number,
        name:
          recordData.properties?.Name?.title?.[0]?.text?.content ||
          recordData.properties?.name?.title?.[0]?.text?.content,
        type:
          recordData.properties?.Type?.select?.name ||
          recordData.properties?.type?.select?.name,
        date:
          recordData.properties?.Date?.date?.start ||
          recordData.properties?.date?.date?.start,
        location:
          recordData.properties?.Location?.select?.name ||
          recordData.properties?.location?.select?.name,
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Notion connection successful',
      databaseId: notionDatabaseId,
      resultsCount: response.results.length,
      sampleRecords: results,
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'

    logger.serverError(
      'Notion connection test failed',
      {
        errorMessage,
      },
      error instanceof Error ? error : undefined
    )

    return NextResponse.json(
      {
        error: 'Failed to connect to Notion',
        details: errorMessage,
        success: false,
      },
      { status: 500 }
    )
  }
}
