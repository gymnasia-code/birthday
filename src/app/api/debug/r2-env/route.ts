import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest, context?: any) {
  // Debug endpoint to understand environment structure
  return NextResponse.json({
    context: {
      hasContext: !!context,
      contextKeys: context ? Object.keys(context) : [],
      contextType: typeof context,
      contextStringified: context ? JSON.stringify(context, null, 2) : null,
    },
    env: {
      processEnvKeys: Object.keys(process.env),
      processEnvBucketKeys: Object.keys(process.env).filter(k =>
        k.includes('BUCKET')
      ),
      hasOrdersBucket: !!(process.env as any).ORDERS_BUCKET,
      ordersBucketType: typeof (process.env as any).ORDERS_BUCKET,
    },
    global: {
      hasGlobal: typeof global !== 'undefined',
      globalKeys: typeof global !== 'undefined' ? Object.keys(global) : [],
      hasGlobalOrdersBucket: !!(global as any)?.ORDERS_BUCKET,
    },
    runtime: 'edge',
    timestamp: new Date().toISOString(),
  })
}
