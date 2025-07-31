import { Language, PartyOrder } from '@/types/party-menu'

export function getBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'en'

  const browserLang = navigator.language.toLowerCase()
  return browserLang.startsWith('ka') || browserLang.includes('ge')
    ? 'ge'
    : 'en'
}

export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'en'

  const stored = localStorage.getItem('party-menu-language')
  return (stored as Language) || getBrowserLanguage()
}

export function setStoredLanguage(language: Language): void {
  if (typeof window === 'undefined') return

  localStorage.setItem('party-menu-language', language)
}

export function getStoredOrder(birthdayId: string) {
  if (typeof window === 'undefined') return null

  const stored = localStorage.getItem(`party-order-${birthdayId}`)
  return stored ? JSON.parse(stored) : null
}

export function setStoredOrder(birthdayId: string, order: PartyOrder): void {
  if (typeof window === 'undefined') return

  localStorage.setItem(`party-order-${birthdayId}`, JSON.stringify(order))
}

export function clearStoredOrder(birthdayId: string): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem(`party-order-${birthdayId}`)
}
