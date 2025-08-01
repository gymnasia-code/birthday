import { MenuItem } from '@/types/party-menu'

// Menu categorization system for organizing birthday menu items
export interface MenuSection {
  key: string
  name: string
  nameGE: string
  items: MenuItem[]
  priority: number
}

const BIRTHDAY_MENU_CATEGORIES = [
  {
    key: 'snacks',
    name: 'Snacks & Appetizers',
    nameGE: 'წახემსება',
    keywords: [
      'snack',
      'bowl',
      'plate',
      'fruit',
      'chips',
      'nuts',
      'crackers',
      'dip',
    ],
    priority: 1,
  },
  {
    key: 'hot_dishes',
    name: 'Hot Dishes',
    nameGE: 'ცხელი კერძები',
    keywords: [
      'khachapuri',
      'ხაჭაპური',
      'lobiani',
      'ლობიანი',
      'burger',
      'ბურგერი',
      'nuggets',
      'ნაგეტსი',
      'hot dog',
      'ჰოთ დოგი',
      'potatoes',
      'კარტოფილი',
      'french fries',
      'fried',
      'შემწვარი',
    ],
    priority: 2,
  },
  {
    key: 'pizza',
    name: 'Pizza',
    nameGE: 'პიცა',
    keywords: [
      'pizza',
      'პიცა',
      'margarita',
      'მარგარიტა',
      'prosciutto',
      'salami',
      'pepperoni',
    ],
    priority: 3,
  },
  {
    key: 'salads',
    name: 'Salads',
    nameGE: 'სალათები',
    keywords: [
      'salad',
      'სალათი',
      'caesar',
      'ცეზარი',
      'green',
      'tomato',
      'პომიდორი',
      'fresh',
    ],
    priority: 4,
  },
  {
    key: 'drinks',
    name: 'Drinks & Beverages',
    nameGE: 'სასმელები',
    keywords: [
      'lemonade',
      'ლიმონათი',
      'kompote',
      'კომპოტი',
      'juice',
      'წვენი',
      'water',
      'წყალი',
      'tea',
      'ჩაი',
      'coffee',
      'ყავა',
      'drink',
      'სასმელი',
      'beverage',
    ],
    priority: 5,
  },
  {
    key: 'special',
    name: 'Special Occasions',
    nameGE: 'სპეციალური',
    keywords: [
      'ceremony',
      'ცერემონია',
      'champagne',
      'შამპანური',
      'birthday',
      'დაბადების',
    ],
    priority: 6,
  },
  {
    key: 'other',
    name: 'Other Items',
    nameGE: 'სხვა',
    keywords: [],
    priority: 7,
  },
]

function categorizeMenuItem(item: MenuItem): string {
  const itemName = item.title.toLowerCase()
  const itemNameGE = item.titleGE?.toLowerCase() || ''
  const itemDescription = item.description?.toLowerCase() || ''
  const itemDescriptionGE = item.descriptionGE?.toLowerCase() || ''
  const searchText = `${itemName} ${itemNameGE} ${itemDescription} ${itemDescriptionGE}`

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

export function organizeMenuIntoSections(items: MenuItem[]): MenuSection[] {
  // Filter items to only include those with photos
  const itemsWithPhotos = items.filter(
    item => item.photo && item.photo.trim() !== ''
  )

  // Group items by category
  const grouped = itemsWithPhotos.reduce(
    (acc, item) => {
      const categoryKey = categorizeMenuItem(item)
      if (!acc[categoryKey]) {
        acc[categoryKey] = []
      }
      acc[categoryKey].push(item)
      return acc
    },
    {} as Record<string, MenuItem[]>
  )

  // Create sections with proper metadata
  const sections: MenuSection[] = []

  for (const category of BIRTHDAY_MENU_CATEGORIES) {
    const items = grouped[category.key] || []
    if (items.length > 0) {
      sections.push({
        key: category.key,
        name: category.name,
        nameGE: category.nameGE,
        items: items.sort((a, b) => a.title.localeCompare(b.title)),
        priority: category.priority,
      })
    }
  }

  // Sort sections by priority
  return sections.sort((a, b) => a.priority - b.priority)
}

export function isBirthdayMenuItem(item: MenuItem): boolean {
  // Only show items with photos for birthday menu
  if (!item.photo || item.photo.trim() === '') {
    return false
  }

  // Use smart categorization to determine if item belongs to birthday menu
  const categoryKey = categorizeMenuItem(item)

  // Any item that can be categorized (not 'other') is considered a birthday menu item
  // This means items with keywords matching our birthday categories are included
  const isCategorized = categoryKey !== 'other'

  // Also include items explicitly marked as birthday party items
  const isExplicitlyBirthday =
    item.category.toLowerCase().includes('birthday party') ||
    item.categoryGE?.toLowerCase().includes('დაბადების წვეულება')

  return isCategorized || isExplicitlyBirthday
}

export function isCafeMenuItem(item: MenuItem): boolean {
  // Only show items with photos and 'tv' in barcode for cafe menu
  if (!item.photo || item.photo.trim() === '') {
    return false
  }

  // Check if barcode contains 'tv'
  const hasBarcodeTv = item.barcode?.toLowerCase().includes('tv') || false

  return (
    hasBarcodeTv &&
    (item.category.toLowerCase().includes('all day menu') ||
      item.categoryGE?.toLowerCase().includes('მთელი დღის მენიუ') ||
      !isBirthdayMenuItem(item))
  )
}

// Export the categorization function for use in other parts of the app
export function getMenuItemCategory(item: MenuItem): string {
  return categorizeMenuItem(item)
}

// Get category information by key
export function getCategoryInfo(key: string) {
  return BIRTHDAY_MENU_CATEGORIES.find(cat => cat.key === key)
}
