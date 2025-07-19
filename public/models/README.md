# 3D Models Directory

This directory contains GLTF (.glb) models used by the 4-wall projection system.

## Directory Structure

- `trees/` - Tree models for forest scenes
- `rocks/` - Stone and rock formations
- `creatures/` - Animated creatures and characters
- `structures/` - Buildings, ruins, and architectural elements

## File Format

All models should be in GLTF 2.0 binary format (.glb) for optimal loading performance.

## Missing Models

When a model file is missing, the system will automatically render a fallback primitive geometry:
- Trees: Green box (1×2×1 units)
- Other models: Brown box (1×2×1 units)

## Model Requirements

- **File Format**: .glb (GLTF 2.0 Binary)
- **Coordinate System**: Y-up, Z-forward
- **Units**: Meters
- **Textures**: Embedded in the .glb file
- **Animations**: Include in the same .glb file

## Referenced Models

The following models are currently referenced in scene configurations:

### Trees
- `oak-tree.glb` - Large oak tree
- `birch-tree.glb` - Tall birch tree
- `pine-tree.glb` - Evergreen pine tree

### Rocks
- `large-boulder.glb` - Large moss-covered boulder
- `rock-formation.glb` - Rocky outcropping

### Creatures
- `forest-spirit.glb` - Animated forest spirit

## Adding New Models

1. Place your .glb file in the appropriate subdirectory
2. Update the scene configuration JSON to reference the model:
   ```json
   {
     "id": "my-model",
     "src": "/models/category/my-model.glb",
     "position": { "x": 0, "y": 0, "z": 0 },
     "rotation": { "x": 0, "y": 0, "z": 0 },
     "scale": { "x": 1, "y": 1, "z": 1 }
   }
   ```

## Testing

The development server will show fallback geometry for missing models, allowing you to test scene layouts before adding final assets.
