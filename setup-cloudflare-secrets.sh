#!/bin/bash

# Cloudflare Pages Secret Setup Script
# This script helps you set up environment variables and secrets for your Cloudflare Pages deployment

echo "🔧 Setting up Cloudflare Pages secrets for birthday-app..."
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI is not installed. Please install it first:"
    echo "npm install -g wrangler"
    echo "or"
    echo "pnpm add -g wrangler"
    exit 1
fi

echo "✅ Wrangler CLI found"
echo ""

# Check if user is logged in
if ! wrangler whoami &> /dev/null; then
    echo "❌ You are not logged in to Cloudflare. Please run:"
    echo "wrangler login"
    exit 1
fi

echo "✅ Logged in to Cloudflare"
echo ""

echo "📝 Setting up secrets..."
echo "Note: You'll be prompted to enter each secret value securely."
echo ""

# Set secrets one by one (using Cloudflare Pages commands)
echo "Setting NOTION_SECRET (your Notion integration secret):"
wrangler pages secret put NOTION_SECRET --project-name birthday-app

echo ""
echo "Setting POSTER_TOKEN (main Poster API token):"
wrangler pages secret put POSTER_TOKEN --project-name birthday-app

echo ""
echo "Setting POSTER_TOKEN_CAFE (Poster API token for cafe location):"
wrangler pages secret put POSTER_TOKEN_CAFE --project-name birthday-app

echo ""
echo "Setting POSTER_TOKEN_PARK (Poster API token for park location):"
wrangler pages secret put POSTER_TOKEN_PARK --project-name birthday-app

echo ""
echo "Setting SLACK_WEBHOOK_URL (Slack webhook for notifications):"
wrangler pages secret put SLACK_WEBHOOK_URL --project-name birthday-app

echo ""
echo "🎉 All secrets have been set!"
echo ""
echo "📋 Summary of what was configured:"
echo "   ✅ NOTION_SECRET - for Notion API access"
echo "   ✅ POSTER_TOKEN - for main Poster API access"
echo "   ✅ POSTER_TOKEN_CAFE - for Poster API access (cafe location)"
echo "   ✅ POSTER_TOKEN_PARK - for Poster API access (park location)"
echo "   ✅ SLACK_WEBHOOK_URL - for Slack notifications"
echo ""
echo "📦 Environment variables (non-sensitive) are already configured in wrangler.jsonc:"
echo "   ✅ NODE_ENV"
echo "   ✅ NOTION_DATABASE_ID"
echo "   ✅ POSTER_API_URL"
echo "   ✅ POSTER_BASE_URL_CAFE"
echo "   ✅ POSTER_BASE_URL_PARK"
echo "   ✅ NEXT_PUBLIC_BASE_URL"
echo ""
echo "🚀 Your app should now have access to all required environment variables in production!"
echo ""
echo "💡 To verify the setup, you can:"
echo "   1. Check secrets: wrangler pages secret list --project-name birthday-app"
echo "   2. Deploy your app: pnpm pages:deploy"
echo "   3. Test the environment variables at: https://bd.gymnasia.ge/api/test/env"
echo "   4. Test integrations at: https://bd.gymnasia.ge/debug"
