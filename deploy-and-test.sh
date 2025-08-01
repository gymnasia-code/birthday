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
        echo "Testing /api/test/env endpoint:"
        curl -s https://bd.gymnasia.ge/api/test/env | jq .
        
        echo ""
        echo "🔍 Testing Notion environment debug:"
        curl -s https://bd.gymnasia.ge/api/debug/notion-env | jq .
        
        echo ""
        echo "🔍 Testing Poster environment debug:"
        curl -s https://bd.gymnasia.ge/api/debug/poster-env | jq .
        
        echo ""
        echo "🎉 Deployment complete!"
        echo ""
        echo "🔗 URLs to test:"
        echo "   • Environment check: https://bd.gymnasia.ge/api/test/env"
        echo "   • Notion debug: https://bd.gymnasia.ge/api/debug/notion-env"
        echo "   • Poster debug: https://bd.gymnasia.ge/api/debug/poster-env"
        echo "   • Debug page: https://bd.gymnasia.ge/debug"
        echo "   • Main app: https://bd.gymnasia.ge"
        
    else
        echo "❌ Deployment failed!"
        exit 1
    fi
else
    echo "❌ Build failed!"
    exit 1
fi
