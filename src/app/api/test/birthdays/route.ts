import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import { logger } from '@/lib/utils/logger'

export const runtime = 'edge'

export async function GET() {
  try {
    logger.serverInfo('Listing birthday records from Notion')

    const notionToken = process.env.NOTION_SECRET
    const notionDatabaseId =
      process.env.NOTION_DATABASE_ID || '7c2bd07e-8bce-4a01-be92-531874f8c760'

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

    // Get birthday records to see what IDs exist
    logger.serverDebug('Querying Notion for birthday records')
    const response = await notion.databases.query({
      database_id: notionDatabaseId,
      page_size: 10,
      filter: {
        property: 'Type',
        select: {
          equals: 'Birthday',
        },
      },
    })

    logger.serverInfo('Birthday records query successful', {
      resultsCount: response.results.length,
    })

    const birthdayRecords = response.results.map((record: any) => ({
      id: record.id,
      uniqueId:
        record.properties?.ID?.unique_id?.number ||
        record.properties?.iD?.unique_id?.number,
      name:
        record.properties?.Name?.title?.[0]?.text?.content ||
        record.properties?.name?.title?.[0]?.text?.content,
      type:
        record.properties?.Type?.select?.name ||
        record.properties?.type?.select?.name,
      date:
        record.properties?.Date?.date?.start ||
        record.properties?.date?.date?.start,
      location:
        record.properties?.Location?.select?.name ||
        record.properties?.location?.select?.name,
      status:
        record.properties?.Status?.status?.name ||
        record.properties?.status?.status?.name,
      kidsQuantity:
        record.properties?.['Kids quantity']?.rich_text?.[0]?.text?.content ||
        record.properties?.kidsQuantity?.rich_text?.[0]?.text?.content,
      adultsQuantity:
        record.properties?.['Adults Quantity']?.rich_text?.[0]?.text?.content ||
        record.properties?.adultsQuantity?.rich_text?.[0]?.text?.content,
    }))

    return NextResponse.json({
      success: true,
      message: 'Birthday records retrieved successfully',
      databaseId: notionDatabaseId,
      totalRecords: response.results.length,
      birthdayRecords,
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'

    logger.serverError(
      'Birthday records query failed',
      {
        errorMessage,
      },
      error instanceof Error ? error : undefined
    )

    return NextResponse.json(
      {
        error: 'Failed to query birthday records',
        details: errorMessage,
        success: false,
      },
      { status: 500 }
    )
  }
}
