#!/bin/bash

# Cloudflare Pages Secret Setup Script
# This script helps you set up all required secrets for the Birthday app

echo "🔐 Setting up Cloudflare Pages secrets for Birthday app..."
echo ""

echo "📝 You'll need to provide the following secrets:"
echo "   1. NOTION_SECRET - Your Notion integration token"
echo "   2. POSTER_TOKEN - Your Poster API token (main)"
echo "   3. POSTER_TOKEN_CAFE - Your Poster API token for cafe"
echo "   4. POSTER_TOKEN_PARK - Your Poster API token for park"
echo "   5. SLACK_WEBHOOK_URL - Your Slack webhook URL for notifications"
echo "   6. GOOGLE_AI_API_KEY - Your Google AI API key for menu suggestions"
echo ""

read -p "Do you want to set up secrets now? (y/n): " confirm

if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
    echo ""
    echo "Setting up secrets for production environment..."
    echo ""
    
    echo "1. Setting NOTION_SECRET..."
    wrangler pages secret put NOTION_SECRET --env production
    
    echo "2. Setting POSTER_TOKEN..."
    wrangler pages secret put POSTER_TOKEN --env production
    
    echo "3. Setting POSTER_TOKEN_CAFE..."
    wrangler pages secret put POSTER_TOKEN_CAFE --env production
    
    echo "4. Setting POSTER_TOKEN_PARK..."
    wrangler pages secret put POSTER_TOKEN_PARK --env production
    
    echo "5. Setting SLACK_WEBHOOK_URL..."
    wrangler pages secret put SLACK_WEBHOOK_URL --env production
    
    echo "6. Setting GOOGLE_AI_API_KEY..."
    wrangler pages secret put GOOGLE_AI_API_KEY --env production
    
    echo ""
    echo "✅ All secrets have been set up!"
    echo ""
    echo "🚀 You can now deploy your application:"
    echo "   npm run build && wrangler pages deploy .vercel/output/static"
else
    echo ""
    echo "⏭️  Skipped secret setup. You can run this script again later."
    echo ""
    echo "📋 Manual commands to set secrets:"
    echo "   wrangler pages secret put NOTION_SECRET --env production"
    echo "   wrangler pages secret put POSTER_TOKEN --env production"
    echo "   wrangler pages secret put POSTER_TOKEN_CAFE --env production"
    echo "   wrangler pages secret put POSTER_TOKEN_PARK --env production"
    echo "   wrangler pages secret put SLACK_WEBHOOK_URL --env production"
    echo "   wrangler pages secret put GOOGLE_AI_API_KEY --env production"
fi

echo ""
echo "💡 To verify your secrets are set:"
echo "   wrangler pages secret list --env production"
