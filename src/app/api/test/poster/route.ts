import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/utils/logger'

export const runtime = 'edge'

export async function GET() {
  try {
    logger.serverInfo('Testing Poster API connection')

    // Check all possible Poster token environment variables
    const posterToken = process.env.POSTER_TOKEN
    const posterTokenCafe = process.env.POSTER_TOKEN_CAFE
    const posterTokenPark = process.env.POSTER_TOKEN_PARK

    const posterApiUrl =
      process.env.POSTER_API_URL || 'https://api.joinposter.com/v3'
    const posterBaseUrlCafe = process.env.POSTER_BASE_URL_CAFE
    const posterBaseUrlPark = process.env.POSTER_BASE_URL_PARK

    logger.serverDebug('Environment variables check', {
      hasPosterToken: !!posterToken,
      hasPosterTokenCafe: !!posterTokenCafe,
      hasPosterTokenPark: !!posterTokenPark,
      posterApiUrl,
      posterBaseUrlCafe,
      posterBaseUrlPark,
    })

    const tokenToTest = posterToken || posterTokenCafe || posterTokenPark
    const urlToTest = posterApiUrl

    if (!tokenToTest) {
      return NextResponse.json(
        {
          error:
            'No Poster token found. Need POSTER_TOKEN, POSTER_TOKEN_CAFE, or POSTER_TOKEN_PARK',
          success: false,
          envVars: {
            POSTER_TOKEN: !!posterToken,
            POSTER_TOKEN_CAFE: !!posterTokenCafe,
            POSTER_TOKEN_PARK: !!posterTokenPark,
          },
        },
        { status: 500 }
      )
    }

    // Test the Poster API
    logger.serverDebug('Testing Poster API', {
      urlToTest,
      tokenToTest: tokenToTest.substring(0, 10) + '...',
    })
    const testUrl = `${urlToTest}/menu.getProducts?token=${tokenToTest}`
    const response = await fetch(testUrl)

    logger.serverDebug('Poster API response', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      url: testUrl,
    })

    const responseText = await response.text()
    logger.serverDebug('Poster API raw response', {
      responseLength: responseText.length,
      responseStart: responseText.substring(0, 200),
    })

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Poster API error: ${response.status} ${response.statusText}`,
          success: false,
          details: {
            url: testUrl,
            status: response.status,
            statusText: response.statusText,
            contentType: response.headers.get('content-type'),
            responseStart: responseText.substring(0, 500),
          },
        },
        { status: 500 }
      )
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      return NextResponse.json(
        {
          error: 'Failed to parse JSON response',
          success: false,
          details: {
            url: testUrl,
            parseError:
              parseError instanceof Error
                ? parseError.message
                : 'Unknown parse error',
            responseStart: responseText.substring(0, 500),
            contentType: response.headers.get('content-type'),
          },
        },
        { status: 500 }
      )
    }

    logger.serverInfo('Poster API test successful', {
      responseType: typeof data,
      hasResponse: !!data.response,
      productsCount: data.response?.length || 0,
    })

    const sampleProducts = (data.response || [])
      .slice(0, 3)
      .map((product: any) => ({
        product_id: product.product_id,
        product_name: product.product_name,
        category_name: product.category_name,
        barcode: product.barcode,
        hasPhoto: !!product.photo_origin,
      }))

    return NextResponse.json({
      success: true,
      message: 'Poster API connection successful',
      url: urlToTest,
      productsCount: data.response?.length || 0,
      sampleProducts,
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'

    logger.serverError(
      'Poster API connection test failed',
      {
        errorMessage,
      },
      error instanceof Error ? error : undefined
    )

    return NextResponse.json(
      {
        error: 'Failed to connect to Poster API',
        details: errorMessage,
        success: false,
      },
      { status: 500 }
    )
  }
}
