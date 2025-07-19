#!/bin/bash

# 3D Model Downloader Script for 4-Wall Projection System
# This script downloads free, high-quality GLTF models for your forest scene

echo "🌲 Downloading Free 3D Models for Harry Potter Forest Scene..."

# Create directories
mkdir -p trees rocks creatures structures

echo "📁 Downloading Trees..."
# Duck as animated tree creature (working URL)
curl -L "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Duck/glTF-Binary/Duck.glb" -o trees/animated-duck.glb

echo "🪨 Downloading Rocks and Materials..."
# Metallic spheres for magical crystals (working URL)
curl -L "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/MetalRoughSpheres/glTF-Binary/MetalRoughSpheres.glb" -o rocks/magical-crystals.glb

# Damaged helmet for ancient artifacts (working URL)
curl -L "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb" -o structures/ancient-helmet.glb

echo "🦄 Downloading Creatures..."
# Animated animals from Three.js examples (working URLs)
curl -L "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Horse.glb" -o creatures/horse.glb
curl -L "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Flamingo.glb" -o creatures/flamingo.glb
curl -L "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Stork.glb" -o creatures/stork.glb

# Blender Suzanne monkey head (working URL)
curl -L "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Suzanne/glTF-Binary/Suzanne.glb" -o creatures/suzanne.glb

echo "🏰 Downloading Structures..."
# Box for simple structures (working URL)
curl -L "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Box/glTF-Binary/Box.glb" -o structures/simple-box.glb

# Flight helmet for sci-fi elements (working URL)  
curl -L "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/FlightHelmet/glTF-Binary/FlightHelmet.glb" -o structures/flight-helmet.glb

echo "✅ Download complete! Models are ready for your 4-wall projection system."
echo "📍 Models saved to:"
echo "   🌲 Trees: trees/"
echo "   🪨 Rocks: rocks/" 
echo "   🦄 Creatures: creatures/"
echo "   🏰 Structures: structures/"
echo ""
echo "🔍 Verifying downloads..."
echo "Checking file types:"
file trees/*.glb 2>/dev/null || echo "No tree models downloaded"
file rocks/*.glb 2>/dev/null || echo "No rock models downloaded"  
file creatures/*.glb 2>/dev/null || echo "No creature models downloaded"
file structures/*.glb 2>/dev/null || echo "No structure models downloaded"
echo ""
echo "🚀 Next steps:"
echo "1. Refresh your browser to see the new models"
echo "2. Use Ctrl+D to open dev panel and test modifiers"
echo "3. Replace models with your preferred assets as needed"
echo ""
echo "🔗 For more models, visit:"
echo "   • Sketchfab: https://sketchfab.com/3d-models (filter: Free)"
echo "   • Poly Haven: https://polyhaven.com/models"
echo "   • Quaternius: https://quaternius.com/packs.html"
