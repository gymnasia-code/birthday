import { NextRequest, NextResponse } from 'next/server'
import { PartyOrder } from '@/types/party-menu'
import { logger } from '@/lib/utils/logger'

export const runtime = 'edge'

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

    // TODO: Create order in Poster
    logger.serverDebug('Creating Poster order')
    const posterOrderId = await createPosterOrder(order)
    logger.serverInfo('Poster order created', { posterOrderId })

    // TODO: Update Notion with order status
    logger.serverDebug('Updating Notion order status')
    await updateNotionOrderStatus(order.birthdayId, 'submitted')
    logger.serverInfo('Notion order status updated')

    // TODO: Send Slack notification
    logger.serverDebug('Sending Slack notification')
    await sendSlackNotification(order)
    logger.serverInfo('Slack notification sent')

    logger.serverInfo('Order submission completed successfully', {
      birthdayId: order.birthdayId,
      posterOrderId,
    })

    return NextResponse.json({
      success: true,
      orderId: posterOrderId,
      message: 'Order submitted successfully',
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

async function createPosterOrder(order: PartyOrder): Promise<string> {
  // TODO: Implement Poster order creation
  // https://dev.joinposter.com/en/docs/v3/web/transactions/createOrder
  console.log('Creating Poster order for:', order.birthdayId)
  return 'mock-order-id'
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
