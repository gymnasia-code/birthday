# Birthday App Deployment Guide

## Current Issues and Solutions

### 1. R2 Bucket Not Available Error

**Error:** `[2025-08-02T07:11:15.702Z] ERROR: [SERVER] R2 bucket not available in environment`

**Root Cause:** The R2 bucket binding is not properly configured in the Cloudflare Pages deployment.

**Solutions Applied:**
1. ✅ Fixed API routes to handle multiple environment access patterns
2. ✅ Added comprehensive environment debugging
3. ✅ Created helper functions for environment variable access

### 2. Deployment Steps

#### Prerequisites
- Cloudflare account with Pages enabled
- R2 storage enabled in your Cloudflare account
- All required API keys and tokens

#### Step 1: Create R2 Buckets
```bash
# Create production bucket
wrangler r2 bucket create birthday-orders

# Create preview bucket for development
wrangler r2 bucket create birthday-orders-preview
```

#### Step 2: Configure Cloudflare Pages Project
1. Go to Cloudflare Dashboard → Pages
2. Create a new Pages project or select existing `birthday-app`
3. Go to Settings → Functions
4. Add R2 bucket binding:
   - Variable name: `ORDERS_BUCKET`
   - R2 bucket: `birthday-orders`
   - Preview bucket: `birthday-orders-preview`

#### Step 3: Set Environment Variables
```bash
# Set all required secrets
wrangler pages secret put NOTION_SECRET --env production
wrangler pages secret put POSTER_TOKEN --env production
wrangler pages secret put POSTER_TOKEN_CAFE --env production
wrangler pages secret put POSTER_TOKEN_PARK --env production
wrangler pages secret put SLACK_WEBHOOK_URL --env production
wrangler pages secret put GOOGLE_AI_API_KEY --env production
```

#### Step 4: Deploy Application
```bash
# Build the application
npm run build

# Deploy to Pages
wrangler pages deploy .vercel/output/static --project-name birthday-app
```

### 3. Testing the Fixes

#### Test R2 Environment Setup
```bash
curl https://bd.gymnasia.ge/api/debug/r2-env
```

This endpoint will show you exactly how the environment is structured and help debug R2 access issues.

#### Test Order Retrieval
```bash
curl "https://bd.gymnasia.ge/api/orders/get?birthdayId=1319"
```

#### Test AI Suggestions
```bash
curl 'https://bd.gymnasia.ge/api/orders/suggest' \
  -H 'Content-Type: application/json' \
  -d '{
    "birthdayId": "1319",
    "kids": 10,
    "adults": 10,
    "location": "Gymnasia Lisi",
    "currentOrder": {
      "birthdayId": "1319",
      "location": "Gymnasia Lisi",
      "guests": 20,
      "items": [],
      "notes": "",
      "totalAmount": 0,
      "isSubmitted": false,
      "canModify": true,
      "createdAt": "2025-08-01T12:55:53.953Z",
      "updatedAt": "2025-08-01T17:11:25.737Z"
    }
  }'
```

### 4. Alternative Solutions if R2 Still Doesn't Work

If the R2 bucket binding still doesn't work, we have these backup options:

#### Option A: Use Cloudflare KV Store
- Modify `wrangler.jsonc` to use KV instead of R2
- Update storage utilities to use KV API

#### Option B: Use External Storage
- Use AWS S3 or Google Cloud Storage
- Store credentials as secrets
- Modify storage utilities to use external APIs

#### Option C: Use D1 Database
- Enable D1 database in wrangler.jsonc
- Store orders as JSON in database tables
- More reliable than R2 for this use case

### 5. Monitoring and Debugging

#### Check Deployment Logs
```bash
wrangler pages deployment tail --project-name birthday-app
```

#### Verify Environment Configuration
```bash
# Check Pages project settings
wrangler pages project list

# Check secret configuration
wrangler pages secret list --env production
```

### 6. Key Changes Made

1. **Environment Access Pattern**: Updated all API routes to handle multiple ways of accessing R2 buckets
2. **Menu Optimization**: Removed menu from POST requests to prevent bloat and security issues
3. **Error Handling**: Added comprehensive logging to debug environment issues
4. **Fallback Logic**: Created helper functions to try multiple environment access patterns

### 7. Next Steps

1. ✅ Apply the R2 bucket binding in Cloudflare Pages dashboard
2. ✅ Set all required secrets using wrangler commands
3. ✅ Deploy the updated code
4. ✅ Test the debug endpoint to verify environment structure
5. ✅ Test the actual API endpoints

If R2 binding still doesn't work after these steps, we can implement one of the alternative storage solutions.
