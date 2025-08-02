import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { MenuItem, OrderItem, PartyOrder } from '@/types/party-menu'
import { PARTY_MENU_CONFIG } from '@/config/party-menu'
import { getR2Storage } from '@/lib/utils/r2-storage'
import { logger } from '@/lib/utils/logger'
import { getR2BucketFromEnv, getEnvVar } from '@/lib/utils/cloudflare-env'

export const runtime = 'edge'

interface SuggestionRequest {
  birthdayId: string
  kids: number
  adults: number
  currentOrder: PartyOrder
  location: string // Add location to fetch the appropriate menu
}

interface AISuggestionResponse {
  suggestions: Array<{
    id: string
    quantity: number
    reasoning: string
  }>
  totalEstimatedAmount: number
  explanation: string
}

export async function POST(
  request: NextRequest,
  context?: { env?: { ORDERS_BUCKET: R2Bucket; GOOGLE_AI_API_KEY: string } }
) {
  logger.serverInfo('AI suggestion API called')

  try {
    const body = (await request.json()) as SuggestionRequest
    const { birthdayId, kids, adults, currentOrder, location } = body

    // Calculate expected guest count and check for consistency
    const expectedGuests = kids + adults
    const orderGuests = currentOrder.guests

    logger.serverInfo('AI suggestion API called', {
      birthdayId,
      kids,
      adults,
      expectedGuests,
      orderGuests,
      guestCountMismatch: orderGuests !== expectedGuests,
    })

    if (orderGuests !== expectedGuests) {
      logger.serverWarn('Guest count mismatch in AI suggestion request', {
        birthdayId,
        kids,
        adults,
        expectedGuests,
        orderGuests,
      })
    }

    // Validate request
    if (!birthdayId || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Try to get R2 bucket using the helper function
    const ordersBucket = getR2BucketFromEnv(request, context)

    if (!ordersBucket) {
      logger.serverError('R2 bucket not available in environment')
      return NextResponse.json(
        { error: 'Storage service not available' },
        { status: 500 }
      )
    }

    // Check usage limits
    const r2Storage = getR2Storage({
      ORDERS_BUCKET: ordersBucket,
    })

    const existingOrder = await r2Storage.getLatestOrder(birthdayId)
    const aiSuggestionsUsed = existingOrder?.aiSuggestionsUsed || 0

    if (aiSuggestionsUsed >= 3) {
      logger.serverWarn('AI suggestion limit reached', {
        birthdayId,
        aiSuggestionsUsed,
      })
      return NextResponse.json(
        { error: 'Maximum AI suggestions limit reached (3)' },
        { status: 429 }
      )
    }

    // Fetch birthday menu from the menu API (birthday=true ensures only birthday menu items)
    logger.serverDebug('Fetching birthday menu from API', { location })
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || request.url.split('/api')[0]
    const menuResponse = await fetch(
      `${baseUrl}/api/menu?location=${encodeURIComponent(location)}&birthday=true`
    )

    if (!menuResponse.ok) {
      logger.serverError('Failed to fetch menu', {
        location,
        status: menuResponse.status,
        statusText: menuResponse.statusText,
      })
      return NextResponse.json(
        { error: 'Failed to fetch menu data' },
        { status: 500 }
      )
    }

    const menuData = (await menuResponse.json()) as { menu?: MenuItem[] }
    const menu: MenuItem[] = menuData.menu || []

    if (menu.length === 0) {
      logger.serverWarn('No birthday menu items found', { location })
      return NextResponse.json(
        { error: 'No birthday menu items available' },
        { status: 500 }
      )
    }

    // Initialize Google AI
    const apiKey = getEnvVar('GOOGLE_AI_API_KEY', context)
    if (!apiKey) {
      logger.serverError('Google AI API key missing')
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    // Calculate minimum order amount
    const totalGuests = kids + adults
    const minOrderAmount = totalGuests * PARTY_MENU_CONFIG.minOrderPerPerson
    const targetAmount = Math.round(minOrderAmount * 1.15) // 15% above minimum

    // Menu items are already filtered to birthday menu items by the API
    const birthdayMenu = menu

    // Create detailed prompt
    const prompt = `You are an expert party menu planner for a Georgian birthday party. Please suggest an optimal menu order based on the following requirements:

PARTY DETAILS:
- Kids: ${kids}
- Adults: ${adults}  
- Total guests: ${totalGuests}
- Minimum order requirement: ${minOrderAmount} GEL
- Target order amount: ${targetAmount} GEL (15-30% above minimum)

MENU KNOWLEDGE:
- Drinks are 1L portions (good for 4-5 glasses)
- Pizza, Khachapuri, Lobiani come in 6 pieces per order
- Salads are shareable between 2-3 people
- Champagne ceremony costs 10 GEL per kid (non-alcoholic champagne for children)
- Hot dogs and burgers are single-person portions
- Birthday cakes and desserts are typically shared

IMPORTANT RULES:
- If you order single-portion dishes (like hot dogs or burgers) for kids, make sure every kid gets one (equal quantity for all kids). Same applies for adults: if you order single-portion dishes for adults, every adult should get one. Do not give some kids/adults a single dish and others none.
- If you include the champagne ceremony, its quantity should be equal to the number of kids.

AVAILABLE MENU ITEMS:
${birthdayMenu
  .map(
    (item: MenuItem) => `
ID: ${item.id}
Name: ${item.title} (${item.titleGE})
Description: ${item.description}
Price: ${item.price} GEL
Category: ${item.category}
`
  )
  .join('\n')}

INSTRUCTIONS:
1. Create a balanced menu suitable for ${kids} kids and ${adults} adults
2. Ensure adequate food for everyone (kids eat less, adults eat more)
3. Include variety: main dishes, sides, drinks, and desserts
4. Consider Georgian preferences and birthday traditions
5. Target total amount should be ${targetAmount} GEL (±200 GEL acceptable)
6. Prioritize items that work well for groups and sharing
7. Include champagne ceremony if kids are present (${kids} kids × 10 GEL = ${kids * 10} GEL). If you include it, its quantity should be equal to amount of kids.
8. For single-portion dishes, always order equal portions for all kids or all adults as appropriate

RESPONSE FORMAT (JSON only):
{
  "suggestions": [
    {
      "id": "menu_item_id",
      "quantity": number,
      "reasoning": "Why this item and quantity"
    }
  ],
  "totalEstimatedAmount": number,
  "explanation": "Overall reasoning for this menu selection"
}

Please respond with ONLY valid JSON, no additional text.`

    logger.serverDebug('Sending prompt to AI', {
      birthdayId,
      kids,
      adults,
      menuItemsCount: birthdayMenu.length,
      targetAmount,
    })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    logger.serverDebug('AI response received', {
      birthdayId,
      responseLength: text.length,
    })

    // Parse AI response
    let aiResponse: AISuggestionResponse
    try {
      // Clean up the response in case there's extra text
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const jsonText = jsonMatch ? jsonMatch[0] : text
      aiResponse = JSON.parse(jsonText)
    } catch (parseError) {
      logger.serverError('Failed to parse AI response', {
        birthdayId,
        responseText: text,
        error: parseError instanceof Error ? parseError.message : 'Unknown',
      })
      return NextResponse.json(
        { error: 'AI response parsing failed' },
        { status: 500 }
      )
    }

    // Validate suggestions against available menu
    const validSuggestions = aiResponse.suggestions.filter(suggestion => {
      const menuItem = birthdayMenu.find(
        (item: MenuItem) => item.id === suggestion.id
      )
      return menuItem && suggestion.quantity > 0
    })

    if (validSuggestions.length === 0) {
      logger.serverWarn('No valid suggestions from AI', { birthdayId })
      return NextResponse.json(
        { error: 'AI provided no valid suggestions' },
        { status: 500 }
      )
    }

    // Calculate actual total
    const actualTotal = validSuggestions.reduce((sum, suggestion) => {
      const menuItem = birthdayMenu.find(
        (item: MenuItem) => item.id === suggestion.id
      )
      return sum + (menuItem ? menuItem.price * suggestion.quantity : 0)
    }, 0)

    // Update usage count in R2 storage
    const updatedOrder = {
      ...currentOrder,
      aiSuggestionsUsed: aiSuggestionsUsed + 1,
      lastAiSuggestionAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await r2Storage.saveOrder(updatedOrder)

    logger.serverInfo('AI suggestion successful', {
      birthdayId,
      suggestionsCount: validSuggestions.length,
      actualTotal,
      targetAmount,
      aiSuggestionsUsed: aiSuggestionsUsed + 1,
    })

    return NextResponse.json({
      success: true,
      suggestions: validSuggestions.map(suggestion => {
        const menuItem = birthdayMenu.find(
          (item: MenuItem) => item.id === suggestion.id
        )
        return {
          ...suggestion,
          menuItem,
        }
      }),
      totalEstimatedAmount: actualTotal,
      explanation: aiResponse.explanation,
      aiSuggestionsRemaining: 2 - aiSuggestionsUsed,
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'

    logger.serverError(
      'AI suggestion failed',
      { errorMessage },
      error instanceof Error ? error : undefined
    )

    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    )
  }
}
