# 4-Wall Projection System

An immersive Harry Potter experience with interactive 3D scenes and real-time modifiers built with Next.js 15, Three.js, and React Three Fiber.

## 🌟 Features

### Core Infrastructure

- **4-Wall Projection Setup**: Synchronized views for north, south, east, and west walls
- **JSON Configuration System**: Dynamic scene configuration with layers, lighting, and effects
- **Real-time Modifiers**: URL-based parameters for instant scene customization
- **Three.js Integration**: Advanced 3D rendering with React Three Fiber
- **Edge Runtime**: Optimized for Cloudflare Pages deployment

### Interactive Elements

- **Scene Layers**: Modular rendering system with background trees, lighting, fog, and creatures
- **Particle Systems**: Atmospheric effects including fog, fireflies, and weather
- **Dynamic Lighting**: Ambient, directional, point, and spot lights with animation support
- **Audio Management**: Spatial audio with volume and playback controls
- **Timeline Controller**: Event-driven scene progression

### Developer Tools

- **Dev Panel**: Press `Ctrl+D` for real-time scene modification
- **Live Modifiers**: Adjust fog density, lighting, creature visibility, and more
- **Performance Optimized**: Built for Mac Mini M-series chips

## 🚀 Quick Start

1. **Development Server**

   ```bash
   pnpm dev
   ```

   Visit [http://localhost:3000](http://localhost:3000)

2. **Production Build**

   ```bash
   pnpm build
   pnpm start
   ```

3. **Cloudflare Deployment**
   ```bash
   pnpm pages:build
   pnpm pages:deploy
   ```

## 🎮 Usage

### URL Structure

```
/service/programs/<program_name>/<scene_name>/<wall_number>/?modifiers=<modifiers>
```

### Example URLs

- Basic scene: `/service/programs/harry-potter-experience/forbidden-forest/1`
- With creatures: `/service/programs/harry-potter-experience/forbidden-forest/1?modifiers=show_creatures:true,fog_density:0.8`
- Dawn lighting: `/service/programs/harry-potter-experience/forbidden-forest/2?modifiers=time_of_day:dawn,mystical_intensity:1.5`

### Available Modifiers

- `time_of_day`: dawn, day, dusk, night
- `fog_density`: 0.0 - 1.0
- `show_creatures`: true/false
- `wind_strength`: 0.0 - 3.0
- `mystical_intensity`: 0.0 - 2.0

## 🏗️ Architecture

### Project Structure

```
src/
├── app/
│   ├── service/programs/[name]/[scene_name]/[wall_number]/page.tsx
│   ├── api/scenes/[...slug]/route.ts
│   └── page.tsx
├── components/
│   ├── Scene/
│   │   ├── SceneRenderer.tsx       # Main 3D scene container
│   │   ├── LayerRenderer.tsx       # Layer management
│   │   ├── ModelRenderer.tsx       # 3D model handling
│   │   ├── LightRenderer.tsx       # Lighting system
│   │   ├── ParticleRenderer.tsx    # Particle effects
│   │   └── TimelineController.tsx  # Event timeline
│   ├── Audio/
│   │   └── AudioManager.tsx        # Spatial audio
│   └── UI/
│       └── DevPanel.tsx           # Developer interface
├── types/
│   └── scene.ts                   # TypeScript definitions
└── public/
    └── data/programs/             # Scene configurations
```

### Configuration Files

- **Program Config**: `/public/data/programs/<program>/config.json`
- **Scene Config**: `/public/data/programs/<program>/scenes/<scene>.json`

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **3D Engine**: Three.js + React Three Fiber + Drei
- **Styling**: Tailwind CSS
- **TypeScript**: Full type safety
- **Deployment**: Cloudflare Pages with Edge Runtime
- **Package Manager**: pnpm

## 🎯 Current Implementation Status

✅ **Completed Core Infrastructure**

- [x] Routing system for 4-wall projection
- [x] TypeScript type definitions
- [x] Scene renderer with Three.js integration
- [x] Layer-based rendering system
- [x] Model, light, and particle renderers
- [x] Audio management system
- [x] Timeline controller
- [x] Developer panel with real-time modifiers
- [x] JSON configuration system
- [x] Sample Forbidden Forest scene
- [x] Homepage with navigation
- [x] Cloudflare Pages deployment ready

🚧 **Ready for Enhancement**

- [ ] 3D model assets (GLTF files)
- [ ] Audio files (ambient sounds, effects)
- [ ] Additional scenes (Great Hall, Quidditch Pitch)
- [ ] Advanced particle effects
- [ ] Scene transitions and animations

## 🎨 Demo Scene: Forbidden Forest

The included Forbidden Forest scene showcases:

- **Environment**: Dark, mysterious atmosphere with fog
- **Trees**: Oak and pine trees positioned for 4-wall viewing
- **Lighting**: Moonlight, ambient darkness, mystical glow
- **Particles**: Atmospheric fog and fireflies
- **Creatures**: Unicorn model (configurable)
- **Modifiers**: Time of day, fog density, creature visibility

## 📋 Adding New Scenes

1. **Create Scene Config**: Add JSON file in `/public/data/programs/<program>/scenes/`
2. **Define Layers**: Configure models, lights, particles, and audio
3. **Set Modifiers**: Create interactive parameters
4. **Add Timeline**: Define time-based events
5. **Test**: Use dev panel to fine-tune parameters

## 🔧 Development Notes

### Asset Requirements

- **3D Models**: GLTF format recommended for Three.js compatibility
- **Audio**: MP3 format for web optimization
- **Textures**: Optimized images for performance

### Model Management

The system includes placeholder GLTF files to prevent 404 errors during development:

- All required models have simple box placeholders in `/public/models/`
- Replace placeholders with actual 3D assets as needed
- Missing models automatically fall back to primitive geometry
- Use the development panel (`Ctrl+D`) to test with placeholder models

### Performance Considerations

- Built for Mac Mini M-series chips
- Optimized particle counts for 60fps
- Memory-efficient asset loading
- Edge runtime for global distribution

---

**Built with ❤️ by Gymnasia Interactive**

This system provides a complete foundation for immersive 4-wall projection experiences. The core infrastructure is ready for production use with your 3D assets and audio files.
