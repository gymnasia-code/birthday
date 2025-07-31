// Poster API Types
export interface Spot {
  spot_id: string
  price: string
  profit: string
  profit_netto: string
  visible: string
}

export interface Source {
  id: string
  name: string
  price: string
  visible: string
}

export interface Modification {
  dish_modification_id: string
  name: string
  ingredient_id: string | number
  type: number
  brutto: number
  price: number
  photo_orig: string
  photo_large: string
  photo_small: string
  last_modified_time: string
}

export interface ModificationGroup {
  dish_modification_group_id: number | string
  name: string
  num_min: number | string
  num_max: number | string
  type?: string
  is_deleted: number | string
  modifications: Modification[]
}

export interface Ingredient {
  structure_id: string
  ingredient_id: string
  pr_in_clear: string
  pr_in_cook: string
  pr_in_fry: string
  pr_in_stew: string
  pr_in_bake: string
  structure_unit: string
  structure_type: string
  structure_brutto: number
  structure_netto: number
  structure_lock: string
  structure_selfprice: string
  structure_selfprice_netto: string
  ingredient_name: string
  ingredient_unit: string
  ingredient_weight: number
  ingredients_losses_clear: string
  ingredients_losses_cook: string
  ingredients_losses_fry: string
  ingredients_losses_stew: string
  ingredients_losses_bake: string
}

export interface Product {
  barcode: string
  category_name: string
  unit: string
  cost: string
  cost_netto: string
  fiscal: string
  hidden?: string
  menu_category_id: string
  workshop: string
  nodiscount: string
  photo: string
  photo_origin: string | null
  price?: Record<string, string>
  product_code: string
  product_id: string
  product_name: string
  profit?: Record<string, string>
  sort_order: string
  tax_id: string
  product_tax_id: string
  type: string
  weight_flag: string
  color: string
  spots: Spot[]
  sources: Source[]
  ingredient_id: string
  cooking_time?: string
  different_spots_prices?: string
  group_modifications?: ModificationGroup[]
  out: number
  product_production_description?: string
  ingredients: Ingredient[]
}

export interface GetProductsResponse {
  response: Product[]
}

export interface GetProductsParams {
  token: string
  category_id?: string | number
  type?: 'products' | 'batchtickets'
}

// Party Menu Types
export interface MenuItem {
  id: string
  title: string
  titleGE: string
  description: string
  descriptionGE: string
  photo: string
  price: number
  productId: string
  category: string
  categoryGE: string
  addons?: string
  addonsGE?: string
}

export interface OrderItem {
  menuItem: MenuItem
  quantity: number
  notes?: string
}

export interface PartyOrder {
  birthdayId: string
  location: string
  guests: number
  items: OrderItem[]
  notes: string
  totalAmount: number
  isSubmitted: boolean
  submittedAt?: string
  createdAt: string
  updatedAt: string
  canModify: boolean
}

export interface Birthday {
  id: string
  date: string
  location: string
  isValid: boolean
  customerName?: string
  customerPhone?: string
  kidsQuantity?: string
  adultsQuantity?: string
  program?: string
}

// Notion API Types
export interface NotionBirthday {
  id: string
  properties: {
    ID: { rich_text: [{ text: { content: string } }] }
    Date: { date: { start: string } }
    Location: { select: { name: string } }
    'Customer Name': { title: [{ text: { content: string } }] }
    'Customer Phone': { phone_number: string }
    'Order Status': { select: { name: string } }
  }
}

// Language Types
export type Language = 'en' | 'ge'

export interface Translations {
  [key: string]: {
    en: string
    ge: string
  }
}
