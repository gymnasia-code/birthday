import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get('location') || 'cafe'

  try {
    // Fetch menu without birthday filter to see all categories
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || request.url.split('/api')[0]
    const menuResponse = await fetch(
      `${baseUrl}/api/menu?location=${encodeURIComponent(location)}`
    )

    if (!menuResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch menu' },
        { status: 500 }
      )
    }

    const menuData = (await menuResponse.json()) as { menu?: any[] }
    const menu = menuData.menu || []

    // Analyze categories
    const categories = new Set()
    const categoryStats: Record<string, number> = {}

    menu.forEach(item => {
      if (item.category) {
        categories.add(item.category)
        categoryStats[item.category] = (categoryStats[item.category] || 0) + 1
      }
    })

    // Check which items match birthday criteria
    const birthdayItems = menu.filter(item => {
      return (
        item.category === 'Birthday Party' ||
        item.categoryGE === 'Birthday Party' ||
        item.category?.toLowerCase().includes('birthday')
      )
    })

    return NextResponse.json({
      totalItems: menu.length,
      allCategories: Array.from(categories).sort(),
      categoryStats,
      birthdayItems: birthdayItems.length,
      sampleBirthdayItems: birthdayItems.slice(0, 5).map(item => ({
        title: item.title,
        category: item.category,
        categoryGE: item.categoryGE,
      })),
      sampleAllItems: menu.slice(0, 10).map(item => ({
        title: item.title,
        category: item.category,
        categoryGE: item.categoryGE,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Debug failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
