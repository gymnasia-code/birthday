# 4-Wall Projection System Specification

## Overview

This system provides an immersive 4-wall projection experience for interactive scenes, initially designed for Harry Potter-themed environments. The system renders synchronized 3D scenes across four walls (North, South, East, West) with real-time modifier controls, spatial audio, and dynamic lighting effects.

## Business Requirements

### Primary Objectives

1. **Immersive Experience**: Create a 360-degree immersive environment using 4-wall projection
2. **Interactive Control**: Allow real-time modification of scene parameters through URL modifiers
3. **Scalable Content**: Support multiple programs and scenes through JSON configuration
4. **Production Ready**: Deployable system for live entertainment environments

### Target Use Cases

- **Theme Parks**: Interactive attractions and experiences
- **Museums**: Educational immersive exhibits
- **Entertainment Venues**: Live shows and performances
- **Corporate Events**: Branded immersive experiences

## System Architecture

### URL Structure

```
/service/programs/<program_name>/<scene_name>/<wall_number>/?<modifiers>
```

**Parameters:**

- `program_name`: Program identifier (e.g., "forbidden-forest", "hogwarts-castle")
- `scene_name`: Scene within the program (e.g., "scene1", "entrance", "chamber")
- `wall_number`: Wall position (1=North, 2=East, 3=South, 4=West)
- `modifiers`: URL query parameters for real-time scene control

**Examples:**

```
/service/programs/forbidden-forest/scene1/1/
/service/programs/forbidden-forest/scene1/2/?fog_density=0.8&fireflies_enabled=true
/service/programs/hogwarts-castle/great-hall/3/?lighting_intensity=1.2&ambient_volume=0.5
```

### Configuration System

#### Program Configuration (`/public/data/programs/<program>/config.json`)

```json
{
  "id": "program-id",
  "name": "Display Name",
  "description": "Program description",
  "scenes": ["scene1", "scene2"],
  "defaultModifiers": {
    "modifier_name": "default_value"
  },
  "cameras": {
    "north": { "position": [x, y, z], "target": [x, y, z], "fov": 75 },
    "south": { "position": [x, y, z], "target": [x, y, z], "fov": 75 },
    "east": { "position": [x, y, z], "target": [x, y, z], "fov": 75 },
    "west": { "position": [x, y, z], "target": [x, y, z], "fov": 75 }
  }
}
```

#### Scene Configuration (`/public/data/programs/<program>/scenes/<scene>.json`)

```json
{
  "id": "scene-id",
  "name": "Scene Display Name",
  "description": "Scene description",
  "environment": {
    "backgroundColor": "#000000",
    "fog": {
      "enabled": true,
      "color": "#404040",
      "near": 10,
      "far": 100,
      "density": 0.02
    }
  },
  "layers": [
    {
      "id": "layer-id",
      "name": "Layer Name",
      "visible": true,
      "opacity": 1.0,
      "models": [...],
      "lights": [...],
      "particles": [...],
      "audio": [...]
    }
  ],
  "timeline": {
    "duration": 300,
    "events": [...]
  }
}
```

## Core Components

### 1. SceneRenderer

**Purpose**: Main 3D scene container and camera management
**Responsibilities:**

- Wall-specific camera positioning and orientation
- Environment setup (background, fog, lighting)
- Canvas and WebGL context management
- Performance optimization for projection hardware

**Wall Camera Logic:**

- **North Wall (1)**: Default forward view
- **East Wall (2)**: 90° CCW rotation from North
- **South Wall (3)**: 180° rotation from North
- **West Wall (4)**: 90° CW rotation from North

### 2. LayerRenderer

**Purpose**: Scene organization and visibility control
**Responsibilities:**

- Layer-based scene composition
- Dynamic visibility toggling via modifiers
- Opacity blending and transitions
- Layer-specific rendering optimizations

**Modifier Integration:**

- `<layer_id>_visible`: Boolean visibility control
- `<layer_id>_opacity`: Float opacity control (0.0-1.0)

### 3. ModelRenderer

**Purpose**: 3D model loading and positioning
**Responsibilities:**

- GLTF model loading with fallback system
- Wall-specific coordinate transformation
- Animation control and playback
- Shadow casting and receiving

**Fallback System:**

- **Missing Models**: Renders primitive geometry (boxes)
- **Trees**: Green box (1×2×1 units, 70% opacity)
- **Other Models**: Brown box (1×2×1 units, 70% opacity)
- **Error Handling**: Graceful degradation without breaking render cycle

**Wall Positioning Logic:**

```javascript
switch (wallDirection) {
  case 'north':
    pos = [x, y, z]
    break
  case 'south':
    pos = [-x, y, z]
    break // Flip X
  case 'east':
    pos = [-z, y, x]
    break // 90° CCW rotation
  case 'west':
    pos = [z, y, -x]
    break // 90° CW rotation
}
```

### 4. LightRenderer

**Purpose**: Dynamic lighting system
**Responsibilities:**

- Directional, point, and ambient lighting
- Modifier-controlled intensity and color
- Shadow map configuration
- Performance-optimized lighting for projection

**Light Types:**

- **Directional**: Sun/moon lighting with shadows
- **Point**: Localized light sources (torches, fires)
- **Ambient**: Overall scene illumination
- **Spot**: Focused beam lighting

### 5. ParticleRenderer

**Purpose**: Atmospheric effects and environmental particles
**Responsibilities:**

- Weather effects (fog, rain, snow)
- Magical effects (fireflies, sparkles, energy)
- Performance-optimized particle systems
- Real-time modifier control

**Particle Systems:**

- **Fireflies**: Animated point lights with glow
- **Fog**: Volumetric fog rendering
- **Weather**: Rain, snow, wind effects
- **Magic**: Sparkles, energy streams, portals

### 6. AudioManager

**Purpose**: Spatial audio and sound effects
**Responsibilities:**

- 3D positional audio
- Ambient soundscapes
- Modifier-controlled volume and effects
- Wall-specific audio spatialization

**Audio Features:**

- **Spatial Audio**: 3D positioned sound sources
- **Ambient Tracks**: Background atmospheric sounds
- **Dynamic Volume**: Real-time volume control via modifiers
- **Audio Zones**: Location-based audio triggers

### 7. TimelineController

**Purpose**: Scene timeline and event management
**Responsibilities:**

- Time-based scene events
- Animation synchronization
- State transitions
- Timeline scrubbing and control

### 8. DevPanel

**Purpose**: Development and debugging interface
**Responsibilities:**

- Real-time modifier adjustment
- Scene debugging information
- Performance monitoring
- Quick scene switching

**Access**: Press `Ctrl+D` to toggle development panel

## Modifier System

### Modifier Categories

#### Lighting Modifiers

- `lighting_intensity`: Global lighting multiplier (0.0-2.0)
- `ambient_color`: Ambient light color (hex)
- `<light_id>_enabled`: Individual light toggle
- `<light_id>_intensity`: Individual light intensity

#### Environmental Modifiers

- `fog_density`: Fog density (0.0-1.0)
- `fog_color`: Fog color (hex)
- `background_color`: Scene background color
- `weather_intensity`: Weather effect strength

#### Audio Modifiers

- `ambient_volume`: Ambient audio volume (0.0-1.0)
- `<audio_id>_volume`: Individual audio source volume
- `<audio_id>_enabled`: Individual audio source toggle

#### Model Modifiers

- `<model_id>_visible`: Model visibility toggle
- `<model_id>_x`, `<model_id>_y`, `<model_id>_z`: Position offsets
- `<model_id>_scale`: Uniform scale multiplier
- `<model_id>_float`: Enable floating animation
- `<model_id>_float_speed`: Floating animation speed
- `<model_id>_float_amount`: Floating animation amplitude
- `<model_id>_rotate_y`: Enable Y-axis rotation
- `<model_id>_rotate_speed`: Rotation speed

#### Particle Modifiers

- `<particle_id>_enabled`: Particle system toggle
- `<particle_id>_density`: Particle density multiplier
- `<particle_id>_speed`: Particle animation speed
- `fireflies_enabled`: Enable firefly effects
- `fireflies_count`: Number of fireflies

### Modifier Usage Examples

```
# Basic lighting control
?lighting_intensity=1.5&fog_density=0.3

# Model animation
?tree1_float=true&tree1_float_speed=0.5&tree1_float_amount=0.2

# Audio control
?ambient_volume=0.8&forest_sounds_enabled=true

# Complex scene modification
?lighting_intensity=0.7&fog_density=0.8&fireflies_enabled=true&fireflies_count=50&ambient_volume=0.6
```

## Technical Implementation

### Technology Stack

- **Framework**: Next.js 15.4.2 with App Router
- **Runtime**: Edge Runtime for optimal performance
- **3D Engine**: Three.js with React Three Fiber
- **3D Utilities**: React Three Drei
- **Language**: TypeScript for type safety
- **Deployment**: Cloudflare Pages
- **Package Manager**: pnpm

### Performance Considerations

- **Edge Runtime**: Minimal cold start time
- **Asset Optimization**: GLTF models with embedded textures
- **Fallback System**: Primitive geometry for missing assets
- **Shadow Mapping**: Optimized for projection hardware
- **Particle LOD**: Dynamic particle count based on performance

### File Structure

```
src/
├── app/
│   ├── service/programs/[name]/[scene_name]/[wall_number]/
│   │   └── page.tsx                    # Main projection page
│   ├── api/
│   │   └── scenes/[...slug]/
│   │       └── route.ts                # Scene configuration API
├── components/
│   ├── Scene/
│   │   ├── SceneRenderer.tsx           # Main scene container
│   │   ├── LayerRenderer.tsx           # Layer management
│   │   ├── ModelRenderer.tsx           # 3D model handling
│   │   ├── LightRenderer.tsx           # Lighting system
│   │   ├── ParticleRenderer.tsx        # Particle effects
│   │   ├── AudioManager.tsx            # Spatial audio
│   │   ├── TimelineController.tsx      # Timeline events
│   │   └── DevPanel.tsx                # Development tools
│   └── UI/
├── types/
│   └── scene.ts                        # TypeScript interfaces
└── utils/
    └── sceneLoader.ts                  # Configuration loading

public/
├── data/
│   └── programs/
│       └── <program>/
│           ├── config.json             # Program configuration
│           └── scenes/
│               └── <scene>.json        # Scene configuration
└── models/
    ├── trees/                          # Tree GLTF models
    ├── rocks/                          # Rock GLTF models
    ├── creatures/                      # Character GLTF models
    └── structures/                     # Building GLTF models
```

## Deployment Architecture

### Cloudflare Pages Integration

- **Domain**: bd.gymnasia.ge
- **Build Command**: `pnpm build`
- **Output Directory**: `.next`
- **Edge Runtime**: Global distribution
- **GitHub Integration**: Automatic deployment on push

### Environment Configuration

```typescript
// next.config.ts
export default {
  experimental: {
    runtime: 'edge',
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}
```

## Content Creation Workflow

### Adding New Programs

1. Create program directory: `/public/data/programs/<program_name>/`
2. Add program configuration: `config.json`
3. Create scenes directory: `scenes/`
4. Add scene configurations: `<scene_name>.json`
5. Add 3D models to `/public/models/`

### Scene Development Process

1. **Planning**: Define scene layout and interactive elements
2. **Configuration**: Create JSON scene configuration
3. **Assets**: Prepare GLTF models, textures, and audio
4. **Testing**: Use dev panel for real-time adjustment
5. **Optimization**: Performance testing across all walls
6. **Deployment**: Push to production via GitHub

### Model Requirements

- **Format**: GLTF 2.0 Binary (.glb)
- **Coordinate System**: Y-up, Z-forward
- **Units**: Meters
- **Textures**: Embedded in .glb file
- **Animations**: Included in same file
- **Optimization**: LOD models for performance

## Quality Assurance

### Testing Strategy

- **Unit Tests**: Component-level testing
- **Integration Tests**: Scene loading and rendering
- **Performance Tests**: Frame rate and memory usage
- **Cross-Wall Tests**: Synchronization verification
- **User Acceptance Tests**: Experience validation

### Performance Metrics

- **Target Frame Rate**: 60 FPS per wall
- **Memory Usage**: < 2GB per wall instance
- **Load Time**: < 3 seconds for scene initialization
- **Asset Size**: < 100MB total per scene

### Browser Compatibility

- **Primary**: Chrome 120+, Edge 120+
- **Secondary**: Firefox 120+, Safari 17+
- **WebGL**: Version 2.0 required
- **Hardware**: Dedicated GPU recommended

## Troubleshooting Guide

### Common Issues

#### Missing Models

- **Symptom**: Brown/green boxes instead of 3D models
- **Cause**: GLTF files not found in `/public/models/`
- **Solution**: Add .glb files or update scene configuration

#### Performance Issues

- **Symptom**: Low frame rate or stuttering
- **Cause**: Too many particles, complex models, or lighting
- **Solution**: Reduce particle count, optimize models, simplify lighting

#### Synchronization Problems

- **Symptom**: Walls showing different content
- **Cause**: Network latency or caching issues
- **Solution**: Hard refresh (Ctrl+F5) or check network connectivity

#### Audio Issues

- **Symptom**: No sound or incorrect spatialization
- **Cause**: Browser autoplay policies or WebAudio context
- **Solution**: User interaction required for audio initialization

### Debug Tools

- **Dev Panel**: Press `Ctrl+D` for real-time debugging
- **Console Logs**: Check browser console for errors
- **Performance Monitor**: Built-in FPS and memory tracking
- **Network Tab**: Verify asset loading

## Future Enhancements

### Planned Features

- **Multi-User Sync**: Synchronized experiences across multiple users
- **Hand Tracking**: Gesture-based interaction
- **AI Integration**: Dynamic content generation
- **Analytics**: User behavior and engagement tracking
- **Content Editor**: Visual scene composition tool

### Scalability Considerations

- **CDN Integration**: Global asset distribution
- **Database Backend**: Dynamic configuration management
- **Load Balancing**: Multi-instance deployment
- **Caching Strategy**: Optimized asset delivery

## Conclusion

This 4-wall projection system provides a comprehensive platform for creating immersive, interactive experiences. The modular architecture allows for easy content creation and modification while maintaining high performance and reliability. The system is designed to scale from single installations to large-scale deployment across multiple venues.
