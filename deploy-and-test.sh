#!/bin/bash

# Deploy and Test Script for Cloudflare Pages
echo "🚀 Deploying Birthday App to Cloudflare Pages..."
echo ""

# Build and deploy
echo "📦 Building Next.js app for Cloudflare Pages..."
pnpm pages:build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    
    echo "🌐 Deploying to Cloudflare Pages..."
    pnpm pages:deploy
    
    if [ $? -eq 0 ]; then
        echo "✅ Deployment successful!"
        echo ""
        
        echo "🧪 Testing environment variables..."
        echo "Waiting 10 seconds for deployment to propagate..."
        sleep 10
        
        echo ""
        echo "Testing /api/hello endpoint:"
        curl -s https://bd.gymnasia.ge/api/hello | jq .
        
        echo ""
        echo "🎉 Deployment complete!"
        echo ""
        echo "🔗 URLs to test:"
        echo "   • API health check: https://bd.gymnasia.ge/api/hello"
        echo "   • Main app: https://bd.gymnasia.ge"
        echo ""
        echo "ℹ️  Debug endpoints are disabled in production for security"
        
    else
        echo "❌ Deployment failed!"
        exit 1
    fi
else
    echo "❌ Build failed!"
    exit 1
fi
