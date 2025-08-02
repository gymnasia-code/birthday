export const PARTY_MENU_CONFIG = {
  // How many days before birthday the customer can still modify their order
  modificationDeadlineDays: 1,

  // Minimum order amount required
  minimumOrderAmount: 600,

  // Minimum order amount per person
  minOrderPerPerson: 50,

  // Maximum guests allowed
  maxGuests: 200,

  // Manager contact phone
  managerPhone: '+995 598 901 990',

  // Available locations
  locations: ['Gymnasia Amashukeli 14a', 'Sports Park'] as const,

  // Default language
  defaultLanguage: 'en' as const,
}

export const API_ENDPOINTS = {
  birthday: '/api/birthday',
  menu: '/api/menu',
  orders: '/api/orders',
} as const

export const STORAGE_KEYS = {
  language: 'party-menu-language',
  order: 'party-order-',
} as const
