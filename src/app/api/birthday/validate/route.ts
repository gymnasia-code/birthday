import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import { Birthday } from '@/types/party-menu'
import { logger } from '@/lib/utils/logger'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const birthdayId = searchParams.get('birthdayId')

  logger.serverInfo('Birthday validation API called', { birthdayId })

  try {
    if (!birthdayId) {
      logger.serverWarn('Birthday ID missing in request')
      return NextResponse.json(
        { error: 'Birthday ID is required', isValid: false },
        { status: 400 }
      )
    }

    // Get Notion credentials from environment
    const notionToken = process.env.NOTION_SECRET
    const notionDatabaseId =
      process.env.NOTION_DATABASE_ID || '7c2bd07e-8bce-4a01-be92-531874f8c760'

    logger.serverDebug('Environment variables check', {
      hasNotionToken: !!notionToken,
      notionDatabaseId,
    })

    if (!notionToken) {
      logger.serverError('Notion token missing from environment')
      return NextResponse.json(
        { error: 'Notion configuration missing', isValid: false },
        { status: 500 }
      )
    }

    const notion = new Client({ auth: notionToken })

    logger.serverDebug('Querying Notion database', {
      databaseId: notionDatabaseId,
      birthdayId,
    })

    // Query Notion database for the birthday event by ID
    const response = await notion.databases.query({
      database_id: notionDatabaseId,
      filter: {
        and: [
          {
            property: 'ID',
            unique_id: {
              equals: parseInt(birthdayId),
            },
          },
          {
            property: 'Type',
            select: {
              equals: 'Birthday',
            },
          },
        ],
      },
    })

    logger.serverDebug('Notion query response', {
      resultsCount: response.results.length,
      hasResults: response.results.length > 0,
    })

    if (response.results.length === 0) {
      logger.serverWarn('Birthday not found in Notion', { birthdayId })
      return NextResponse.json(
        { error: 'Birthday not found', isValid: false },
        { status: 404 }
      )
    }

    interface NotionDateProperty {
      start?: string
    }

    interface NotionProperty {
      date?: NotionDateProperty
      select?: { name?: string }
      title?: Array<{ text?: { content?: string } }>
      rich_text?: Array<{ text?: { content?: string } }>
    }

    const notionRecord = response.results[0] as {
      id: string
      properties: Record<string, NotionProperty>
    }

    logger.serverDebug('Notion record found', {
      id: notionRecord.id,
      properties: Object.keys(notionRecord.properties || {}),
    })

    // Extract data based on your actual Notion schema
    const properties = notionRecord.properties || {}

    const birthday: Birthday = {
      id: birthdayId,
      date:
        (properties.Date as NotionProperty)?.date?.start ||
        (properties.date as NotionProperty)?.date?.start ||
        '',
      location:
        (properties.Location as NotionProperty)?.select?.name ||
        (properties.location as NotionProperty)?.select?.name ||
        'unknown',
      isValid: true,
      customerName:
        (properties.Name as NotionProperty)?.title?.[0]?.text?.content ||
        (properties.name as NotionProperty)?.title?.[0]?.text?.content ||
        'Unknown Customer',
      customerPhone: undefined, // Phone not in your schema
      kidsQuantity:
        (properties['Kids quantity'] as NotionProperty)?.rich_text?.[0]?.text
          ?.content ||
        (properties.kidsQuantity as NotionProperty)?.rich_text?.[0]?.text
          ?.content,
      adultsQuantity:
        (properties['Adults Quantity'] as NotionProperty)?.rich_text?.[0]?.text
          ?.content ||
        (properties.adultsQuantity as NotionProperty)?.rich_text?.[0]?.text
          ?.content,
      program:
        (properties.Program as NotionProperty)?.rich_text?.[0]?.text?.content ||
        (properties.program as NotionProperty)?.rich_text?.[0]?.text?.content,
      notionPageId: notionRecord.id, // Add the actual Notion page ID
    }

    logger.serverInfo('Birthday validation successful', {
      birthdayId,
      customerName: birthday.customerName,
      date: birthday.date,
      location: birthday.location,
    })

    return NextResponse.json(birthday)
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'

    logger.serverError(
      'Birthday validation failed',
      {
        birthdayId,
        errorMessage,
      },
      error instanceof Error ? error : undefined
    )

    return NextResponse.json(
      { error: 'Failed to validate birthday', isValid: false },
      { status: 500 }
    )
  }
}
