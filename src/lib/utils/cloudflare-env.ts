import { NextRequest } from 'next/server'

// Types for Cloudflare environment
interface CloudflareEnv {
  ORDERS_BUCKET?: R2Bucket
  GOOGLE_AI_API_KEY?: string
  SLACK_WEBHOOK_URL?: string
}

// Helper function to get R2 bucket from various sources
export function getR2BucketFromEnv(
  request: NextRequest,
  context?: any
): R2Bucket | null {
  // Try different ways to access the R2 bucket

  // Method 1: From context.env (standard Cloudflare Pages)
  if (context?.env?.ORDERS_BUCKET) {
    console.log('Found R2 bucket in context.env')
    return context.env.ORDERS_BUCKET
  }

  // Method 2: From process.env (might work in some deployments)
  if ((process.env as any).ORDERS_BUCKET) {
    console.log('Found R2 bucket in process.env')
    return (process.env as any).ORDERS_BUCKET
  }

  // Method 3: From global (Cloudflare Workers style)
  if ((global as any).ORDERS_BUCKET) {
    console.log('Found R2 bucket in global')
    return (global as any).ORDERS_BUCKET
  }

  // Method 4: From request.cf bindings (alternative Cloudflare approach)
  if ((request as any).cf?.env?.ORDERS_BUCKET) {
    console.log('Found R2 bucket in request.cf.env')
    return (request as any).cf.env.ORDERS_BUCKET
  }

  // Method 5: Check if it's available under different binding names
  const possibleNames = ['ORDERS_BUCKET', 'orders_bucket', 'OrdersBucket']
  for (const name of possibleNames) {
    if (context?.env?.[name]) {
      console.log(`Found R2 bucket under name: ${name}`)
      return context.env[name]
    }
    if ((process.env as any)[name]) {
      console.log(`Found R2 bucket in process.env under name: ${name}`)
      return (process.env as any)[name]
    }
  }

  console.error('R2 bucket not found in any expected location', {
    hasContext: !!context,
    hasContextEnv: !!context?.env,
    contextEnvKeys: context?.env ? Object.keys(context.env) : [],
    processEnvKeys: Object.keys(process.env).filter(k =>
      k.toLowerCase().includes('bucket')
    ),
    hasRequestCf: !!(request as any).cf,
  })

  return null
}

// Helper function to get environment variables with fallbacks
export function getEnvVar(key: string, context?: any): string | undefined {
  return context?.env?.[key] || process.env[key] || (global as any)?.[key]
}
