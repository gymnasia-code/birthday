import { NextRequest, NextResponse } from 'next/server'
import { orderBy } from 'lodash'
import { MenuItem, Product, GetProductsResponse } from '@/types/party-menu'
import { Location } from '@/lib/config/party-menu'
import { logger } from '@/lib/utils/logger'

export const runtime = 'edge'

// Intelligent categorization system for birthday menu items
interface MenuCategory {
  key: string
  name: string
  nameGE: string
  keywords: string[]
  priority: number
}

const BIRTHDAY_MENU_CATEGORIES: MenuCategory[] = [
  {
    key: 'snacks',
    name: 'Snacks & Appetizers',
    nameGE: 'წახემსება',
    keywords: ['snack', 'bowl', 'plate', 'fruit'],
    priority: 1,
  },
  {
    key: 'hot_dishes',
    name: 'Hot Dishes',
    nameGE: 'ცხელი კერძები',
    keywords: [
      'khachapuri',
      'lobiani',
      'burger',
      'nuggets',
      'hot dog',
      'potatoes',
    ],
    priority: 2,
  },
  {
    key: 'pizza',
    name: 'Pizza',
    nameGE: 'პიცა',
    keywords: ['pizza', 'margarita', 'prosciutto', 'salami'],
    priority: 3,
  },
  {
    key: 'salads',
    name: 'Salads',
    nameGE: 'სალათები',
    keywords: ['salad', 'caesar', 'green', 'tomato'],
    priority: 4,
  },
  {
    key: 'drinks',
    name: 'Drinks & Beverages',
    nameGE: 'სასმელები',
    keywords: [
      'lemonade',
      'kompote',
      'juice',
      'water',
      'tea',
      'coffee',
      'drink',
    ],
    priority: 5,
  },
  {
    key: 'special',
    name: 'Special Occasions',
    nameGE: 'სპეციალური',
    keywords: ['ceremony', 'champagne', 'birthday'],
    priority: 6,
  },
]

function categorizeMenuItem(item: MenuItem): string {
  const itemName = item.title.toLowerCase()
  const itemDescription = item.description?.toLowerCase() || ''
  const searchText = `${itemName} ${itemDescription}`

  // Find the best matching category
  for (const category of BIRTHDAY_MENU_CATEGORIES) {
    for (const keyword of category.keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return category.key
      }
    }
  }

  // Default category for unmatched items
  return 'other'
}

function sortMenuItemsIntelligently(items: MenuItem[]): MenuItem[] {
  // First, categorize all items
  const categorizedItems = items.map(item => ({
    ...item,
    categoryKey: categorizeMenuItem(item),
  }))

  // Sort by category priority, then alphabetically within each category
  return orderBy(
    categorizedItems,
    [
      // Primary sort: category priority
      item => {
        const category = BIRTHDAY_MENU_CATEGORIES.find(
          cat => cat.key === item.categoryKey
        )
        return category ? category.priority : 999
      },
      // Secondary sort: alphabetical within category
      'title',
    ],
    ['asc', 'asc']
  )
}

function getCategoryForItem(item: MenuItem): MenuCategory | null {
  const categoryKey = categorizeMenuItem(item)
  return BIRTHDAY_MENU_CATEGORIES.find(cat => cat.key === categoryKey) || null
}

class CafeMenuItem {
  glovo: string = ''
  category: string = ''
  categoryGE: string = ''
  name: string = ''
  nameGE: string = ''
  description: string = ''
  descriptionGE: string = ''
  addons: string = ''
  addonsGE: string = ''
  price: number = 0
  priceAddons: number = 0
  glovoPrice: number = 0
  image: string = ''
  image2: string = ''
  image3: string = ''
  images: string[] = []
  tags: string = ''
}

function transformProduct(product: Product): MenuItem {
  const menuItem = new CafeMenuItem()

  // Basic information
  menuItem.name = product.product_name
  menuItem.category = product.category_name

  // Handle price - assuming first price in the record if it exists
  if (product.price && Object.keys(product.price).length > 0) {
    const firstPrice = Object.values(product.price)[0]
    menuItem.price = parseInt(firstPrice) || 0
    menuItem.price = menuItem.price / 100
  }

  // Handle images
  if (product.photo_origin) {
    menuItem.image =
      'https://gymnasiacafe.joinposter.com' + product.photo_origin
    menuItem.images = [menuItem.image]
  }

  // Handle description
  if (product.product_production_description) {
    menuItem.description = product.product_production_description
  }

  // Handle addons - transform group modifications if they exist
  if (product.group_modifications && product.group_modifications.length > 0) {
    menuItem.addons = product.group_modifications
      .map(group => group.name || '')
      .filter(name => name)
      .join(', ')
  }

  // Transform to MenuItem interface
  return {
    id: product.product_id,
    title: menuItem.name,
    titleGE: menuItem.nameGE || '', // Will be filled later with translations
    description: menuItem.description,
    descriptionGE: menuItem.descriptionGE || '',
    photo: menuItem.image,
    price: menuItem.price,
    productId: product.product_id,
    barcode: product.barcode,
    category: menuItem.category,
    categoryGE: menuItem.categoryGE || '',
    addons: menuItem.addons,
    addonsGE: menuItem.addonsGE || '',
  }
}

async function getPosterProducts(
  token: string,
  baseUrl: string
): Promise<GetProductsResponse> {
  const response = await fetch(`${baseUrl}/menu.getProducts?token=${token}`)

  if (!response.ok) {
    throw new Error(`Poster API error: ${response.status}`)
  }

  return response.json()
}

async function getCafeMenu(
  token: string,
  baseUrl: string,
  isBirthdayMenu: boolean = false
): Promise<MenuItem[]> {
  logger.serverDebug('Fetching Poster products', { baseUrl, isBirthdayMenu })

  const { response } = await getPosterProducts(token, baseUrl)

  logger.serverDebug('Poster products received', {
    totalProducts: response.length,
    tvProducts: response.filter(x => x.barcode?.includes('tv')).length,
  })

  // Transform products to MenuItems
  let processedItems = response.map(transformProduct)

  // Filter items to only include those with photos
  processedItems = processedItems.filter(
    item => item.photo && item.photo.trim() !== ''
  )

  // Apply different filtering based on menu type
  if (isBirthdayMenu) {
    // For birthday menu requests, return all items with photos (frontend will filter)
    processedItems = sortMenuItemsIntelligently(processedItems)
    logger.serverDebug(
      'Applied intelligent sorting for birthday menu request',
      {
        itemCount: processedItems.length,
        filterType: 'frontend_filtering',
      }
    )
  } else {
    // For cafe menu, only show items with 'tv' in barcode
    processedItems = processedItems.filter(item =>
      item.barcode?.toLowerCase().includes('tv')
    )

    // Sort cafe menu items by barcode order
    processedItems = orderBy(processedItems, x => {
      return parseInt(x.barcode.replace('tv', '')) || 0
    })

    logger.serverDebug('Applied cafe menu filtering', {
      itemCount: processedItems.length,
      filterType: 'tv_barcode_only',
    })
  }

  return processedItems
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get('location') // Don't cast to Location yet

  logger.serverInfo('Menu API called', { location })

  try {
    if (!location) {
      logger.serverWarn('No location provided')
      return NextResponse.json(
        { error: 'Location parameter is required' },
        { status: 400 }
      )
    }

    // Map location parameter to environment variable keys
    // Support both the new location names and legacy ones
    let tokenKey: string
    let baseUrlKey: string

    if (
      location === 'cafe' ||
      location === 'Gymnasia Lisi' ||
      location === 'Vake'
    ) {
      tokenKey = 'POSTER_TOKEN_CAFE'
      baseUrlKey = 'POSTER_BASE_URL_CAFE'
    } else if (location === 'park' || location === 'Sports Park') {
      tokenKey = 'POSTER_TOKEN_PARK'
      baseUrlKey = 'POSTER_BASE_URL_PARK'
    } else {
      // Fallback to main token from .env.example
      tokenKey = 'POSTER_TOKEN'
      baseUrlKey = 'POSTER_API_URL'
    }

    const token = process.env[tokenKey] || process.env.POSTER_TOKEN
    const baseUrl =
      process.env[baseUrlKey] ||
      process.env.POSTER_API_URL ||
      'https://joinposter.com/api'

    logger.serverDebug('Environment variables check', {
      location,
      tokenKey,
      baseUrlKey,
      hasToken: !!token,
      baseUrl,
      fallbackUsed: !process.env[tokenKey] && !!process.env.POSTER_TOKEN,
    })

    if (!token) {
      logger.serverError('Poster token missing', {
        location,
        tokenKey,
        hasFallbackToken: !!process.env.POSTER_TOKEN,
      })
      return NextResponse.json(
        {
          error: `Poster token missing for location: ${location}. Check ${tokenKey} or POSTER_TOKEN environment variable.`,
        },
        { status: 500 }
      )
    }

    logger.serverDebug('Fetching menu for location', { location })

    // Determine if this is likely a birthday menu request based on location or context
    const isBirthdayMenu =
      location.includes('birthday') ||
      searchParams.get('birthday') === 'true' ||
      searchParams.get('birthdayId') !== null

    const menu = await getCafeMenu(token, baseUrl, isBirthdayMenu)

    logger.serverInfo('Menu fetched successfully', {
      location,
      menuItemsCount: menu.length,
      isBirthdayMenu,
    })

    return NextResponse.json({ menu })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'

    logger.serverError(
      'Menu API failed',
      {
        location,
        errorMessage,
      },
      error instanceof Error ? error : undefined
    )

    return NextResponse.json(
      {
        error: 'Failed to fetch menu',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}
