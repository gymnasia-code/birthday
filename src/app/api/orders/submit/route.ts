import { NextRequest, NextResponse } from 'next/server'
import { PartyOrder } from '@/types/party-menu'
import { logger } from '@/lib/utils/logger'
import { getR2Storage } from '@/lib/utils/r2-storage'

export const runtime = 'edge'

interface Env {
  ORDERS_BUCKET: R2Bucket
}

export async function POST(request: NextRequest) {
  try {
    const order: PartyOrder = await request.json()

    logger.serverInfo('Order submission received', {
      birthdayId: order.birthdayId,
      location: order.location,
      guests: order.guests,
      totalAmount: order.totalAmount,
      itemsCount: order.items.length,
    })

    if (!order.birthdayId || !order.location) {
      logger.serverWarn('Order submission missing required fields', {
        hasBirthdayId: !!order.birthdayId,
        hasLocation: !!order.location,
      })
      return NextResponse.json(
        { error: 'Birthday ID and location are required' },
        { status: 400 }
      )
    }

    // Validate minimum order amount
    const minOrderPerPerson = 50 // This should come from config
    const requiredTotal = order.guests * minOrderPerPerson

    logger.serverDebug('Order validation', {
      totalAmount: order.totalAmount,
      requiredTotal,
      minOrderPerPerson,
      guests: order.guests,
    })

    if (order.totalAmount < requiredTotal) {
      logger.serverWarn('Order below minimum amount', {
        totalAmount: order.totalAmount,
        requiredTotal,
      })
      return NextResponse.json(
        {
          error: `Order total (${order.totalAmount} GEL) is below minimum required (${requiredTotal} GEL)`,
        },
        { status: 400 }
      )
    }

    // Save order to R2 storage
    logger.serverDebug('Saving order to R2 storage')
    const r2Storage = getR2Storage({
      ORDERS_BUCKET: process.env.ORDERS_BUCKET as any,
    })
    await r2Storage.saveOrder(order)
    logger.serverInfo('Order saved to R2 storage', {
      birthdayId: order.birthdayId,
    })

    // TODO: Update Notion with order status
    logger.serverDebug('Updating Notion order status')
    await updateNotionOrderStatus(order.birthdayId, 'submitted')
    logger.serverInfo('Notion order status updated')

    // Send Slack notification
    logger.serverDebug('Sending Slack notification')
    await sendSlackNotification(order)
    logger.serverInfo('Slack notification sent')

    logger.serverInfo('Order submission completed successfully', {
      birthdayId: order.birthdayId,
      totalAmount: order.totalAmount,
      itemsCount: order.items.length,
    })

    return NextResponse.json({
      success: true,
      orderId: `${order.birthdayId}-${Date.now()}`,
      message:
        'Order received successfully! Your order has been saved and you can still modify it until 1 day before your birthday. We will contact you soon to confirm the details.',
      canStillModify: true,
      modificationDeadline: '1 day before your birthday',
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'

    logger.serverError(
      'Order submission failed',
      {
        errorMessage,
      },
      error instanceof Error ? error : undefined
    )

    return NextResponse.json(
      { error: 'Failed to submit order' },
      { status: 500 }
    )
  }
}

async function updateNotionOrderStatus(
  birthdayId: string,
  status: string
): Promise<void> {
  // TODO: Implement Notion update
  console.log('Updating Notion order status:', birthdayId, status)
}

async function sendSlackNotification(order: PartyOrder): Promise<void> {
  // TODO: Implement Slack notification
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL

  if (!slackWebhookUrl) {
    console.warn('Slack webhook URL not configured')
    return
  }

  const message = {
    text: `🎉 New birthday order submitted!`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Birthday ID:* ${order.birthdayId}\n*Location:* ${order.location}\n*Guests:* ${order.guests}\n*Total Amount:* ${order.totalAmount} GEL`,
        },
      },
    ],
  }

  try {
    await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })
  } catch (error) {
    console.error('Failed to send Slack notification:', error)
  }
}
