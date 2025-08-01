'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Minus, Phone } from 'lucide-react'
import { toast } from 'sonner'
import {
  MenuItem,
  OrderItem,
  PartyOrder,
  Birthday,
  Language,
} from '@/types/party-menu'
import { PARTY_MENU_CONFIG } from '@/config/party-menu'
import { translations } from '@/lib/translations'
import {
  getStoredLanguage,
  setStoredLanguage,
  getStoredOrder,
  setStoredOrder,
  clearStoredOrder,
} from '@/lib/utils/storage'
import { logger } from '@/lib/utils/logger'
import {
  organizeMenuIntoSections,
  isBirthdayMenuItem,
  isCafeMenuItem,
  MenuSection,
} from '@/lib/utils/menu-categorization'

export const runtime = 'edge'

export default function PartyMenuPage() {
  const searchParams = useSearchParams()
  const birthdayId = searchParams?.get('birthdayId')
  const guests = parseInt(searchParams?.get('guests') || '0')
  const location = searchParams?.get('location') || 'cafe'

  logger.clientInfo('PartyMenuPage component initialized', {
    birthdayId,
    guests,
    location,
    searchParamsKeys: searchParams ? Array.from(searchParams.keys()) : [],
  })

  const [language, setLanguage] = useState<Language>('en')
  const [birthday, setBirthday] = useState<Birthday | null>(null)
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [order, setOrder] = useState<PartyOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [notes, setNotes] = useState('')
  const [activeTab, setActiveTab] = useState<'birthday' | 'cafe'>('birthday')

  const t = (key: keyof typeof translations) => translations[key][language]

  useEffect(() => {
    const storedLang = getStoredLanguage()
    setLanguage(storedLang)
  }, [])

  const initializeData = useCallback(async () => {
    logger.clientInfo('Initializing party menu data', {
      birthdayId,
      guests,
      location,
    })

    try {
      setLoading(true)

      // Validate birthday
      logger.clientDebug('Validating birthday', { birthdayId })
      const birthdayResponse = await fetch(
        `/api/birthday/validate?birthdayId=${birthdayId}`
      )

      logger.clientDebug('Birthday validation response', {
        status: birthdayResponse.status,
        statusText: birthdayResponse.statusText,
      })

      const birthdayData = (await birthdayResponse.json()) as Birthday & {
        error?: string
      }

      logger.clientDebug('Birthday validation data', {
        isValid: birthdayData.isValid,
        customerName: birthdayData.customerName,
        date: birthdayData.date,
      })

      if (!birthdayData.isValid) {
        logger.clientWarn('Birthday validation failed', {
          isValid: birthdayData.isValid,
          error: birthdayData.error,
        })
        toast.error(translations.invalidBirthday[language])
        return
      }

      setBirthday(birthdayData)
      logger.clientInfo('Birthday validated successfully', {
        customerName: birthdayData.customerName,
        date: birthdayData.date,
      })

      // Check if order modification is still allowed
      const birthdayDate = new Date(birthdayData.date)
      const now = new Date()
      const daysDiff = Math.ceil(
        (birthdayDate.getTime() - now.getTime()) / (1000 * 3600 * 24)
      )
      const canModify = daysDiff > PARTY_MENU_CONFIG.modificationDeadlineDays

      logger.clientDebug('Order modification check', {
        birthdayDate: birthdayData.date,
        daysDiff,
        canModify,
        modificationDeadlineDays: PARTY_MENU_CONFIG.modificationDeadlineDays,
      })

      // Load menu
      logger.clientDebug('Loading menu', { location })
      const menuResponse = await fetch(
        `/api/menu?location=${encodeURIComponent(location)}&birthdayId=${birthdayId}&birthday=true`
      )

      logger.clientDebug('Menu response', {
        status: menuResponse.status,
        statusText: menuResponse.statusText,
      })

      const menuData = (await menuResponse.json()) as {
        menu?: MenuItem[]
        error?: string
        details?: string
      }

      logger.clientDebug('Menu data received', {
        hasMenu: !!menuData.menu,
        menuItemsCount: menuData.menu?.length || 0,
        error: menuData.error,
        details: menuData.details,
      })

      if (menuData.error) {
        logger.clientError('Menu API returned error', {
          error: menuData.error,
          details: menuData.details,
        })
        toast.error(`Menu loading failed: ${menuData.error}`)
        return
      }

      setMenu(menuData.menu || [])

      // Load stored order or create new one
      if (birthdayId) {
        // First check if there's an existing order in R2 storage
        logger.clientDebug('Checking for existing order in R2 storage')
        try {
          const orderResponse = await fetch(
            `/api/orders/get?birthdayId=${birthdayId}`
          )
          const orderData = (await orderResponse.json()) as {
            success: boolean
            order: PartyOrder | null
            message?: string
          }

          if (orderResponse.ok && orderData.success && orderData.order) {
            // Found existing order in R2 storage - use it
            const existingOrder = orderData.order
            logger.clientInfo('Loaded existing order from R2 storage', {
              itemsCount: existingOrder.items.length,
              totalAmount: existingOrder.totalAmount,
              isSubmitted: existingOrder.isSubmitted,
            })

            setOrder({
              ...existingOrder,
              canModify: canModify, // Allow modification based on deadline, regardless of submission status
            })
            setNotes(existingOrder.notes || '')
          } else {
            // No order in R2 storage, check localStorage as fallback
            const storedOrder = getStoredOrder(birthdayId)
            logger.clientDebug('R2 storage check result', {
              hasR2Order: false,
              hasStoredOrder: !!storedOrder,
              storedOrderItemsCount: storedOrder?.items?.length || 0,
            })

            if (storedOrder) {
              setOrder({
                ...storedOrder,
                canModify: canModify, // Allow modification based on deadline, regardless of submission status
              })
              setNotes(storedOrder.notes || '')
              logger.clientInfo('Loaded existing order from localStorage', {
                itemsCount: storedOrder.items.length,
                totalAmount: storedOrder.totalAmount,
              })
            } else {
              // Create new order
              const newOrder = {
                birthdayId,
                location,
                guests,
                items: [],
                notes: '',
                totalAmount: 0,
                isSubmitted: false,
                canModify,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
              setOrder(newOrder)
              logger.clientInfo('Created new order', newOrder)
            }
          }
        } catch (orderError) {
          // If R2 check fails, fall back to localStorage
          logger.clientWarn(
            'R2 storage check failed, falling back to localStorage',
            {
              error:
                orderError instanceof Error
                  ? orderError.message
                  : 'Unknown error',
            }
          )

          const storedOrder = getStoredOrder(birthdayId)
          if (storedOrder) {
            setOrder({
              ...storedOrder,
              canModify: canModify, // Allow modification based on deadline, regardless of submission status
            })
            setNotes(storedOrder.notes || '')
            logger.clientInfo(
              'Loaded existing order from localStorage (fallback)',
              {
                itemsCount: storedOrder.items.length,
                totalAmount: storedOrder.totalAmount,
              }
            )
          } else {
            // Create new order
            const newOrder = {
              birthdayId,
              location,
              guests,
              items: [],
              notes: '',
              totalAmount: 0,
              isSubmitted: false,
              canModify,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            setOrder(newOrder)
            logger.clientInfo('Created new order (fallback)', newOrder)
          }
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'

      logger.clientError(
        'Error initializing data',
        {
          birthdayId,
          guests,
          location,
          errorMessage,
        },
        error instanceof Error ? error : undefined
      )

      toast.error('Failed to load data')
    } finally {
      setLoading(false)
      logger.clientDebug('Initialize data completed')
    }
  }, [birthdayId, guests, location, language]) // Removed 't' and added 'language' instead

  useEffect(() => {
    logger.clientInfo('Party menu page useEffect triggered', {
      birthdayId,
      guests,
      location,
      hasValidParams: !!(birthdayId && guests && guests > 0),
    })

    // Don't initialize if parameters are invalid - the component will show error state
    if (!birthdayId || !guests || guests <= 0) {
      logger.clientError('Invalid parameters provided', {
        birthdayId,
        guests,
        location,
      })
      return
    }

    initializeData()
  }, [birthdayId, guests, location, initializeData])

  const updateOrder = (updatedOrder: PartyOrder) => {
    const newOrder = {
      ...updatedOrder,
      updatedAt: new Date().toISOString(),
    }
    setOrder(newOrder)
    setStoredOrder(birthdayId!, newOrder)
  }

  const addToOrder = (menuItem: MenuItem) => {
    if (!order || !order.canModify) return

    const existingItemIndex = order.items.findIndex(
      item => item.menuItem.id === menuItem.id
    )

    let newItems: OrderItem[]
    if (existingItemIndex >= 0) {
      newItems = order.items.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    } else {
      newItems = [...order.items, { menuItem, quantity: 1 }]
    }

    const totalAmount = newItems.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0
    )

    updateOrder({
      ...order,
      items: newItems,
      totalAmount,
    })
  }

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (!order || !order.canModify) return

    let newItems: OrderItem[]
    if (quantity <= 0) {
      newItems = order.items.filter(item => item.menuItem.id !== menuItemId)
    } else {
      newItems = order.items.map(item =>
        item.menuItem.id === menuItemId ? { ...item, quantity } : item
      )
    }

    const totalAmount = newItems.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0
    )

    updateOrder({
      ...order,
      items: newItems,
      totalAmount,
    })
  }

  const submitOrder = async () => {
    if (!order || !order.canModify) return // Check canModify instead of isSubmitted

    const minTotal = guests * PARTY_MENU_CONFIG.minOrderPerPerson
    if (order.totalAmount < minTotal) {
      toast.error(
        `${t('minOrderWarning')} ${PARTY_MENU_CONFIG.minOrderPerPerson} ${t('gel')}`
      )
      return
    }

    try {
      setSubmitting(true)

      const finalOrder = {
        ...order,
        notes,
        isSubmitted: true,
        submittedAt: new Date().toISOString(),
      }

      const response = await fetch('/api/orders/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalOrder),
      })

      if (response.ok) {
        const result = (await response.json()) as {
          success: boolean
          message?: string
          canStillModify?: boolean
          modificationDeadline?: string
        }

        updateOrder(finalOrder)
        clearStoredOrder(birthdayId!)

        // Show detailed success message
        const isUpdate = order.isSubmitted
        toast.success(
          language === 'en'
            ? isUpdate
              ? "Order updated successfully! We'll contact you soon to confirm the changes."
              : "Order received successfully! You can still modify it until 1 day before your birthday. We'll contact you soon to confirm the details."
            : isUpdate
              ? 'შეკვეთა წარმატებით განახლდა! მალე დაგიკავშირდებით ცვლილებების დასადასტურებლად.'
              : 'შეკვეთა წარმატებით მიღებულია! შეგიძლიათ კვლავ შეცვალოთ იგი დაბადების დღემდე 1 დღით ადრე. მალე დაგიკავშირდებით დეტალების დასადასტურებლად.',
          {
            duration: 8000, // Show for 8 seconds
          }
        )
      } else {
        const error = (await response.json()) as { message?: string }
        toast.error(
          language === 'en'
            ? error.message ||
                'Failed to submit order. Please try again or contact our manager.'
            : error.message ||
                'შეკვეთის გაგზავნა ვერ მოხერხდა. გთხოვთ, სცადოთ ხელახლა ან დაუკავშირდით ჩვენს მენეჯერს.',
          {
            duration: 6000, // Show for 6 seconds
          }
        )
      }
    } catch (error) {
      console.error('Error submitting order:', error)
      toast.error(
        language === 'en'
          ? 'Failed to submit order due to connection issues. Your order is saved locally - please try again or contact our manager.'
          : 'შეკვეთის გაგზავნა ვერ მოხერხდა კავშირის პრობლემების გამო. თქვენი შეკვეთა ლოკალურად არის შენახული - გთხოვთ, სცადოთ ხელახლა ან დაუკავშირდით ჩვენს მენეჯერს.',
        {
          duration: 8000, // Show for 8 seconds
        }
      )
    } finally {
      setSubmitting(false)
    }
  }

  const switchLanguage = () => {
    const newLang = language === 'en' ? 'ge' : 'en'
    setLanguage(newLang)
    setStoredLanguage(newLang)
  }

  // Check for missing parameters first
  if (!birthdayId || !guests || guests <= 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <CardContent>
            <h2 className="text-xl font-bold mb-4 text-center">
              Missing Parameters
            </h2>
            <p className="text-center text-red-600 mb-4">
              This page requires URL parameters to work properly.
            </p>
            <div className="text-sm text-gray-800 mb-4">
              <strong>Required parameters:</strong>
              <ul className="list-disc list-inside mt-2">
                <li>birthdayId: {birthdayId || 'MISSING'}</li>
                <li>guests: {guests || 'MISSING'}</li>
                <li>location: {location}</li>
              </ul>
            </div>
            <div className="text-center">
              <a
                href="/debug"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Go to Debug Page
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t('loadingMenu')}</span>
      </div>
    )
  }

  if (!birthday || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <CardContent>
            <p className="text-center text-red-600">{t('invalidBirthday')}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const minTotal = guests * PARTY_MENU_CONFIG.minOrderPerPerson
  const isOrderValid = order.totalAmount >= minTotal

  // Filter menu items based on active tab and organize into sections
  const filteredMenu = menu.filter(item => {
    if (activeTab === 'birthday') {
      return isBirthdayMenuItem(item)
    } else {
      return isCafeMenuItem(item)
    }
  })

  // Organize filtered menu into intelligent sections for birthday menu
  const menuSections =
    activeTab === 'birthday' ? organizeMenuIntoSections(filteredMenu) : null

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{t('partyMenu')}</h1>
          <Button
            onClick={switchLanguage}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
          >
            {language === 'en' ? 'ქართული' : 'English'}
          </Button>
        </div>

        {/* Order Info */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex justify-between items-center text-gray-800">
              <span>{birthday.customerName || `Birthday #${birthdayId}`}</span>
              {order.isSubmitted && order.canModify && (
                <Badge variant="default">{t('submittedCanModify')}</Badge>
              )}
              {order.isSubmitted && !order.canModify && (
                <Badge variant="secondary">{t('submittedReadOnly')}</Badge>
              )}
              {!order.isSubmitted && !order.canModify && (
                <Badge variant="secondary">Read Only</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">{t('guests')}:</span> {guests}
              </div>
              <div>
                <span className="font-medium">Location:</span> {location}
              </div>
              <div>
                <span className="font-medium">Date:</span>{' '}
                {new Date(birthday.date).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">{t('total')}:</span>{' '}
                {order.totalAmount} {t('gel')}
              </div>
            </div>
            {order.isSubmitted && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 text-sm">
                  ✅{' '}
                  <strong>
                    {language === 'en'
                      ? 'Order received!'
                      : 'შეკვეთა მიღებულია!'}
                  </strong>{' '}
                  {order.canModify
                    ? language === 'en'
                      ? "You can still modify it until 1 day before your birthday. We'll contact you soon."
                      : 'შეგიძლიათ კვლავ შეცვალოთ იგი დაბადების დღემდე 1 დღით ადრე. მალე დაგიკავშირდებით.'
                    : language === 'en'
                      ? "The modification deadline has passed. We'll contact you soon to confirm the details."
                      : 'შეცვლის ვადა ამოიწურა. მალე დაგიკავშირდებით დეტალების დასადასტურებლად.'}
                </p>
              </div>
            )}
            {!isOrderValid && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800 text-sm">
                  {t('minOrderWarning')} {PARTY_MENU_CONFIG.minOrderPerPerson}{' '}
                  {t('gel')}
                  (Total minimum: {minTotal} {t('gel')})
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Menu Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('selectMenu')}</CardTitle>
                {/* Menu Tabs */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab('birthday')}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      activeTab === 'birthday'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {t('birthdayMenu')}
                  </button>
                  <button
                    onClick={() => setActiveTab('cafe')}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      activeTab === 'cafe'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {t('cafeMenu')}
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredMenu.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>{t('noItemsInCategory')}</p>
                  </div>
                ) : activeTab === 'birthday' && menuSections ? (
                  // Organized sections for birthday menu
                  <div className="space-y-6">
                    {menuSections.map(section => (
                      <div key={section.key} className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                          {language === 'ge' ? section.nameGE : section.name}
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {section.items.map(item => (
                            <Card
                              key={item.id}
                              className="overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors duration-200 border-gray-200"
                            >
                              {item.photo && (
                                <Image
                                  src={item.photo}
                                  alt={
                                    language === 'ge'
                                      ? item.titleGE
                                      : item.title
                                  }
                                  className="w-full h-48 object-cover"
                                  width={400}
                                  height={200}
                                />
                              )}
                              <CardContent className="p-4">
                                <h3 className="font-semibold mb-2 text-gray-800">
                                  {language === 'ge'
                                    ? item.titleGE || item.title
                                    : item.title}
                                </h3>
                                <p className="text-sm text-gray-600 mb-2">
                                  {language === 'ge'
                                    ? item.descriptionGE || item.description
                                    : item.description}
                                </p>
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-gray-800">
                                    {item.price} {t('gel')}
                                  </span>
                                  {order.canModify && (
                                    <Button
                                      onClick={() => addToOrder(item)}
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 shadow-sm hover:shadow-md"
                                    >
                                      <Plus className="h-4 w-4 mr-1" />
                                      {t('addToOrder')}
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Regular grid layout for cafe menu
                  <div className="grid md:grid-cols-2 gap-4">
                    {filteredMenu.map(item => (
                      <Card
                        key={item.id}
                        className="overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors duration-200 border-gray-200"
                      >
                        {item.photo && (
                          <Image
                            src={item.photo}
                            alt={language === 'ge' ? item.titleGE : item.title}
                            className="w-full h-48 object-cover"
                            width={400}
                            height={200}
                          />
                        )}
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2 text-gray-800">
                            {language === 'ge'
                              ? item.titleGE || item.title
                              : item.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {language === 'ge'
                              ? item.descriptionGE || item.description
                              : item.description}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-800">
                              {item.price} {t('gel')}
                            </span>
                            {order.canModify && (
                              <Button
                                onClick={() => addToOrder(item)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 shadow-sm hover:shadow-md"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                {t('addToOrder')}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4 border-green-200">
              <CardHeader>
                <CardTitle className="text-gray-800">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {order.items.length === 0 ? (
                  <p className="text-gray-700 text-center py-4">
                    No items in order
                  </p>
                ) : (
                  <div className="space-y-3">
                    {order.items.map(item => (
                      <div
                        key={item.menuItem.id}
                        className="flex justify-between items-center"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {language === 'ge'
                              ? item.menuItem.titleGE || item.menuItem.title
                              : item.menuItem.title}
                          </p>
                          <p className="text-sm text-gray-800">
                            {item.menuItem.price} {t('gel')} × {item.quantity}
                          </p>
                        </div>
                        {order.canModify && (
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() =>
                                updateQuantity(
                                  item.menuItem.id,
                                  item.quantity - 1
                                )
                              }
                              size="sm"
                              variant="outline"
                              className="border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium text-gray-700">
                              {item.quantity}
                            </span>
                            <Button
                              onClick={() =>
                                updateQuantity(
                                  item.menuItem.id,
                                  item.quantity + 1
                                )
                              }
                              size="sm"
                              variant="outline"
                              className="border-gray-300 text-gray-600 hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-colors duration-200"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {order.items.length > 0 && (
                  <>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between font-bold">
                        <span>{t('total')}:</span>
                        <span>
                          {order.totalAmount} {t('gel')}
                        </span>
                      </div>
                    </div>

                    {order.canModify && (
                      <>
                        <div className="mt-4">
                          <label className="block text-sm font-medium mb-2">
                            {t('notes')}
                          </label>
                          <Textarea
                            value={notes}
                            onChange={(
                              e: React.ChangeEvent<HTMLTextAreaElement>
                            ) => setNotes(e.target.value)}
                            placeholder="Special requests..."
                            rows={3}
                          />
                        </div>

                        {/* Helpful message about order modification */}
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            {t('orderModificationInfo')}
                          </p>
                        </div>

                        <Button
                          onClick={submitOrder}
                          disabled={!isOrderValid || submitting}
                          className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:hover:bg-gray-400"
                        >
                          {submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          {order.isSubmitted
                            ? t('updateOrder')
                            : t('submitOrder')}
                        </Button>
                      </>
                    )}
                  </>
                )}

                <div className="mt-6 pt-4 border-t">
                  <p className="text-sm text-gray-800 mb-2">
                    {t('managerContact')}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <a
                      href={`tel:${PARTY_MENU_CONFIG.managerPhone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {PARTY_MENU_CONFIG.managerPhone}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
