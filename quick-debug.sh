#!/bin/bash

echo "🔍 Quick Production Health Check"
echo "================================="
echo ""

echo "📝 Testing API health:"
curl -s https://bd.gymnasia.ge/api/hello | jq .

echo ""
echo "ℹ️  Debug endpoints are disabled in production for security."
echo "   For debugging issues, please check server logs or use development environment."

echo ""
echo "🧪 Testing actual Poster connection:"
curl -s https://bd.gymnasia.ge/api/test/poster | jq .
