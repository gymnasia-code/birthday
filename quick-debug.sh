#!/bin/bash

echo "🔍 Quick Environment Debug Test"
echo "================================"
echo ""

echo "📝 Testing general environment variables:"
curl -s https://bd.gymnasia.ge/api/test/env | jq .

echo ""
echo "🔍 Testing Notion environment specifically:"
curl -s https://bd.gymnasia.ge/api/debug/notion-env | jq .

echo ""
echo "🔍 Testing Poster environment specifically:"
curl -s https://bd.gymnasia.ge/api/debug/poster-env | jq .

echo ""
echo "🧪 Testing actual Notion connection:"
curl -s https://bd.gymnasia.ge/api/test/notion | jq .

echo ""
echo "🧪 Testing actual Poster connection:"
curl -s https://bd.gymnasia.ge/api/test/poster | jq .
