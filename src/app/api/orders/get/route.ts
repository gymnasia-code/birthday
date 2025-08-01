import { NextRequest, NextResponse } from 'next/server'
import { getR2Storage } from '@/lib/utils/r2-storage'
import { logger } from '@/lib/utils/logger'

export const runtime = 'edge'

interface Env {
  ORDERS_BUCKET: R2Bucket
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const birthdayId = searchParams.get('birthdayId')

  logger.serverInfo('Get order API called', { birthdayId })

  try {
    if (!birthdayId) {
      logger.serverWarn('Birthday ID missing in request')
      return NextResponse.json(
        { error: 'Birthday ID is required' },
        { status: 400 }
      )
    }

    // Get R2 storage instance
    const r2Storage = getR2Storage({
      ORDERS_BUCKET: process.env.ORDERS_BUCKET as any,
    })

    // Try to get the latest order for this birthday
    const latestOrder = await r2Storage.getLatestOrder(birthdayId)

    if (!latestOrder) {
      logger.serverInfo('No existing order found', { birthdayId })
      return NextResponse.json({
        success: true,
        order: null,
        message: 'No existing order found',
      })
    }

    logger.serverInfo('Order retrieved successfully', {
      birthdayId,
      totalAmount: latestOrder.totalAmount,
      itemsCount: latestOrder.items.length,
      isSubmitted: latestOrder.isSubmitted,
    })

    return NextResponse.json({
      success: true,
      order: latestOrder,
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'

    logger.serverError(
      'Get order API failed',
      {
        birthdayId,
        errorMessage,
      },
      error instanceof Error ? error : undefined
    )

    return NextResponse.json(
      { error: 'Failed to retrieve order' },
      { status: 500 }
    )
  }
}
