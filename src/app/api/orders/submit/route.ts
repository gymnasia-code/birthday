import { NextRequest, NextResponse } from 'next/server'
import { PartyOrder, Birthday } from '@/types/party-menu'
import { logger } from '@/lib/utils/logger'
import { getR2Storage } from '@/lib/utils/r2-storage'

export const runtime = 'edge'

interface Env {
  ORDERS_BUCKET: R2Bucket
}

interface OrderSubmissionRequest {
  order: PartyOrder
  birthday: Birthday
}

export async function POST(
  request: NextRequest,
  context?: { env?: { ORDERS_BUCKET: R2Bucket; SLACK_WEBHOOK_URL?: string } }
) {
  try {
    const { order, birthday }: OrderSubmissionRequest = await request.json()

    // Calculate the correct guest count from birthday data to avoid localStorage inconsistencies
    const kidsCount = Number(birthday.kidsQuantity) || 0
    const adultsCount = Number(birthday.adultsQuantity) || 0
    const calculatedGuests = kidsCount + adultsCount

    // Use the calculated guest count instead of potentially stale order.guests
    const correctedOrder = {
      ...order,
      guests: calculatedGuests,
    }

    logger.serverInfo('Order submission received', {
      birthdayId: order.birthdayId,
      location: order.location,
      kids: kidsCount,
      adults: adultsCount,
      originalGuests: order.guests,
      calculatedGuests: calculatedGuests,
      guestCountMismatch: order.guests !== calculatedGuests,
      totalAmount: order.totalAmount,
      itemsCount: order.items.length,
    })

    if (order.guests !== calculatedGuests) {
      logger.serverWarn(
        'Guest count mismatch detected, using calculated value',
        {
          birthdayId: order.birthdayId,
          orderGuests: order.guests,
          calculatedGuests: calculatedGuests,
          kids: kidsCount,
          adults: adultsCount,
        }
      )
    }

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

    // Try to get R2 bucket from different possible sources
    const ordersBucket =
      context?.env?.ORDERS_BUCKET ||
      (process.env as any).ORDERS_BUCKET ||
      (global as any).ORDERS_BUCKET

    if (!ordersBucket) {
      logger.serverError('R2 bucket not available in environment', {
        hasContext: !!context,
        hasEnv: !!context?.env,
        envKeys: context?.env ? Object.keys(context.env) : [],
        processEnvKeys: Object.keys(process.env).filter(k =>
          k.includes('BUCKET')
        ),
      })
      return NextResponse.json(
        { error: 'Storage service not available' },
        { status: 500 }
      )
    }

    // Validate minimum order amount using corrected guest count
    const minOrderPerPerson = 50 // This should come from config
    const requiredTotal = correctedOrder.guests * minOrderPerPerson

    logger.serverDebug('Order validation', {
      totalAmount: correctedOrder.totalAmount,
      requiredTotal,
      minOrderPerPerson,
      guests: correctedOrder.guests,
    })

    if (correctedOrder.totalAmount < requiredTotal) {
      logger.serverWarn('Order below minimum amount', {
        totalAmount: correctedOrder.totalAmount,
        requiredTotal,
      })
      return NextResponse.json(
        {
          error: `Order total (${correctedOrder.totalAmount} GEL) is below minimum required (${requiredTotal} GEL)`,
        },
        { status: 400 }
      )
    }

    // Save corrected order to R2 storage
    logger.serverDebug('Saving corrected order to R2 storage')
    const r2Storage = getR2Storage({
      ORDERS_BUCKET: ordersBucket,
    })
    await r2Storage.saveOrder(correctedOrder)
    logger.serverInfo('Order saved to R2 storage', {
      birthdayId: correctedOrder.birthdayId,
    })

    // TODO: Update Notion with order status
    logger.serverDebug('Updating Notion order status')
    await updateNotionOrderStatus(correctedOrder.birthdayId, 'submitted')
    logger.serverInfo('Notion order status updated')

    // Send Slack notification
    logger.serverDebug('Sending Slack notification')
    await sendSlackNotification(
      correctedOrder,
      birthday,
      context?.env?.SLACK_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL
    )
    logger.serverInfo('Slack notification sent')

    logger.serverInfo('Order submission completed successfully', {
      birthdayId: correctedOrder.birthdayId,
      totalAmount: correctedOrder.totalAmount,
      itemsCount: correctedOrder.items.length,
      finalGuests: correctedOrder.guests,
    })

    return NextResponse.json({
      success: true,
      orderId: `${correctedOrder.birthdayId}-${Date.now()}`,
      message:
        'Order received successfully! Your order has been saved and you can still modify it until 1 day before your birthday. We will contact you soon to confirm the details.',
      canStillModify: true,
      modificationDeadline: '1 day before your birthday',
      guestCountCorrected: order.guests !== calculatedGuests,
      correctedGuests: correctedOrder.guests,
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

async function sendSlackNotification(
  order: PartyOrder,
  birthday: Birthday,
  slackWebhookUrl?: string
): Promise<void> {
  if (!slackWebhookUrl) {
    console.warn('Slack webhook URL not configured')
    return
  }

  const itemsList = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.menuItem.title}* x${item.quantity} — ${item.menuItem.price * item.quantity} GEL`
    )
    .join('\n')

  // Generate correct Notion document link using the actual page ID
  let notionLink = '#'
  if (birthday.notionPageId) {
    // Format: https://www.notion.so/{workspace}/{page-title-slug-and-id}
    const notionWorkspace = 'gymnasia' // This could be made configurable via env var
    const pageIdFormatted = birthday.notionPageId.replace(/-/g, '')
    // Create a slug from customer name or use 'birthday'
    const titleSlug = birthday.customerName
      ? birthday.customerName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
      : 'birthday'
    notionLink = `https://www.notion.so/${notionWorkspace}/${titleSlug}-${pageIdFormatted}`
  }

  // Format date in a human-readable way
  const birthdayDate = new Date(birthday.date)
  const formattedDate = birthdayDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Calculate kids and adults from birthday data for consistent display
  const kidsCount = Number(birthday.kidsQuantity) || 0
  const adultsCount = Number(birthday.adultsQuantity) || 0

  const message = {
    text: `🎉 New birthday order submitted!`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Birthday ID:* ${order.birthdayId}\n*Customer:* ${birthday.customerName || 'N/A'}\n*Location:* ${order.location}\n*Kids:* ${kidsCount}\n*Adults:* ${adultsCount}\n*Total Guests:* ${order.guests}\n*Total Amount:* ${order.totalAmount} GEL\n*Date:* ${formattedDate}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Ordered Items:*\n${itemsList}`,
        },
      },
      ...(order.notes
        ? [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Special Notes:*\n${order.notes}`,
              },
            },
          ]
        : []),
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `📋 <${notionLink}|View in Notion Database>`,
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
