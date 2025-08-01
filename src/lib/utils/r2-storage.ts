import { PartyOrder } from '@/types/party-menu'
import { logger } from './logger'

// Cloudflare R2 storage utilities
export class R2Storage {
  private bucket: R2Bucket

  constructor(bucket: R2Bucket) {
    this.bucket = bucket
  }

  /**
   * Save an order to R2 storage
   */
  async saveOrder(order: PartyOrder): Promise<void> {
    try {
      const orderKey = `orders/${order.birthdayId}/${Date.now()}-${order.birthdayId}.json`
      const orderData = {
        ...order,
        savedAt: new Date().toISOString(),
        version: '1.0',
      }

      await this.bucket.put(orderKey, JSON.stringify(orderData, null, 2), {
        customMetadata: {
          birthdayId: order.birthdayId,
          location: order.location,
          totalAmount: order.totalAmount.toString(),
          itemsCount: order.items.length.toString(),
          savedAt: orderData.savedAt,
        },
      })

      logger.serverInfo('Order saved to R2 storage', {
        orderKey,
        birthdayId: order.birthdayId,
        totalAmount: order.totalAmount,
      })
    } catch (error) {
      logger.serverError('Failed to save order to R2 storage', {
        birthdayId: order.birthdayId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }

  /**
   * Get the latest order for a birthday ID
   */
  async getLatestOrder(birthdayId: string): Promise<PartyOrder | null> {
    try {
      const objects = await this.bucket.list({
        prefix: `orders/${birthdayId}/`,
      })

      if (objects.objects.length === 0) {
        logger.serverInfo('No orders found for birthday', { birthdayId })
        return null
      }

      // Sort by key (which includes timestamp) to get the latest
      const latestObject = objects.objects.sort((a: R2Object, b: R2Object) =>
        b.key.localeCompare(a.key)
      )[0]

      const orderData = await this.bucket.get(latestObject.key)
      if (!orderData) {
        logger.serverWarn('Order object exists but content is null', {
          birthdayId,
          orderKey: latestObject.key,
        })
        return null
      }

      const orderJson = await orderData.text()
      const order = JSON.parse(orderJson) as PartyOrder

      logger.serverInfo('Order retrieved from R2 storage', {
        birthdayId,
        orderKey: latestObject.key,
        totalAmount: order.totalAmount,
      })

      return order
    } catch (error) {
      logger.serverError('Failed to retrieve order from R2 storage', {
        birthdayId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }

  /**
   * Get all orders for a birthday ID
   */
  async getAllOrders(birthdayId: string): Promise<PartyOrder[]> {
    try {
      const objects = await this.bucket.list({
        prefix: `orders/${birthdayId}/`,
      })

      if (objects.objects.length === 0) {
        return []
      }

      const orders: PartyOrder[] = []

      // Get all order objects
      for (const obj of objects.objects) {
        try {
          const orderData = await this.bucket.get(obj.key)
          if (orderData) {
            const orderJson = await orderData.text()
            const order = JSON.parse(orderJson) as PartyOrder
            orders.push(order)
          }
        } catch (error) {
          logger.serverWarn('Failed to parse order object', {
            birthdayId,
            orderKey: obj.key,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }

      // Sort by createdAt or updatedAt to get chronological order
      orders.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )

      logger.serverInfo('All orders retrieved from R2 storage', {
        birthdayId,
        ordersCount: orders.length,
      })

      return orders
    } catch (error) {
      logger.serverError('Failed to retrieve all orders from R2 storage', {
        birthdayId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }

  /**
   * Delete all orders for a birthday ID
   */
  async deleteAllOrders(birthdayId: string): Promise<void> {
    try {
      const objects = await this.bucket.list({
        prefix: `orders/${birthdayId}/`,
      })

      for (const obj of objects.objects) {
        await this.bucket.delete(obj.key)
      }

      logger.serverInfo('All orders deleted from R2 storage', {
        birthdayId,
        deletedCount: objects.objects.length,
      })
    } catch (error) {
      logger.serverError('Failed to delete orders from R2 storage', {
        birthdayId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }

  /**
   * Check if orders exist for a birthday ID
   */
  async hasOrders(birthdayId: string): Promise<boolean> {
    try {
      const objects = await this.bucket.list({
        prefix: `orders/${birthdayId}/`,
        limit: 1,
      })

      return objects.objects.length > 0
    } catch (error) {
      logger.serverError('Failed to check if orders exist in R2 storage', {
        birthdayId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return false
    }
  }
}

// Helper function to get R2 storage instance
export function getR2Storage(env: { ORDERS_BUCKET: R2Bucket }): R2Storage {
  return new R2Storage(env.ORDERS_BUCKET)
}
