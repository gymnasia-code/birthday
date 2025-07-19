#!/bin/bash

# Model Verification Script
# Checks all GLTF models for validity

echo "🔍 Verifying 3D Models in 4-Wall Projection System..."
echo ""

# Check main scene models
echo "📋 Main Scene Models:"
echo "🌲 Trees:"
if [ -f "public/models/trees/oak-tree.glb" ]; then
    echo "  oak-tree.glb: $(file public/models/trees/oak-tree.glb | cut -d: -f2-)"
else
    echo "  ❌ oak-tree.glb: Missing"
fi

if [ -f "public/models/trees/pine-tree.glb" ]; then
    echo "  pine-tree.glb: $(file public/models/trees/pine-tree.glb | cut -d: -f2-)"
else
    echo "  ❌ pine-tree.glb: Missing"
fi

echo ""
echo "🪨 Rocks:"
if [ -f "public/models/rocks/large-boulder.glb" ]; then
    echo "  large-boulder.glb: $(file public/models/rocks/large-boulder.glb | cut -d: -f2-)"
else
    echo "  ❌ large-boulder.glb: Missing"
fi

echo ""
echo "🦄 Creatures:"
if [ -f "public/models/creatures/forest-spirit.glb" ]; then
    echo "  forest-spirit.glb: $(file public/models/creatures/forest-spirit.glb | cut -d: -f2-)"
else
    echo "  ❌ forest-spirit.glb: Missing"
fi

echo ""
echo "📊 File Sizes:"
echo "Main models total size:"
du -ch public/models/trees/oak-tree.glb public/models/rocks/large-boulder.glb public/models/creatures/forest-spirit.glb 2>/dev/null | tail -1

echo ""
echo "🎮 Testing URLs:"
echo "Wall 1: http://localhost:3002/service/programs/forbidden-forest/scene1/1"
echo "Wall 2: http://localhost:3002/service/programs/forbidden-forest/scene1/2" 
echo "Wall 3: http://localhost:3002/service/programs/forbidden-forest/scene1/3"
echo "Wall 4: http://localhost:3002/service/programs/forbidden-forest/scene1/4"

echo ""
echo "🔧 Dev Panel: Press Ctrl+D in any wall view"
echo ""

# Check for corrupted files
echo "⚠️  Checking for corrupted models:"
for file in public/models/*/*.glb; do
    if file "$file" | grep -q "HTML"; then
        echo "  ❌ CORRUPTED: $file (HTML file instead of GLTF)"
    fi
done

echo ""
echo "✅ Verification complete!"
