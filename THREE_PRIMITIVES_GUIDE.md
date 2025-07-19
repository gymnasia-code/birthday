# Three.js Primitives Reference for 4-Wall Projection

## Basic Geometries

### Box Geometry (Current)

```tsx
// Three.js
import { BoxGeometry } from 'three'
const geometry = new BoxGeometry(width, height, depth)

// React Three Fiber
<boxGeometry args={[width, height, depth]} />
```

### Sphere Geometry

```tsx
// Three.js
import { SphereGeometry } from 'three'
const geometry = new SphereGeometry(radius, widthSegments, heightSegments)

// React Three Fiber
<sphereGeometry args={[1, 32, 32]} />
```

### Cylinder Geometry (Great for tree trunks)

```tsx
// Three.js
import { CylinderGeometry } from 'three'
const geometry = new CylinderGeometry(radiusTop, radiusBottom, height, segments)

// React Three Fiber
<cylinderGeometry args={[0.1, 0.3, 2, 8]} />
```

### Cone Geometry (Tree tops, rocks)

```tsx
// Three.js
import { ConeGeometry } from 'three'
const geometry = new ConeGeometry(radius, height, segments)

// React Three Fiber
<coneGeometry args={[0.5, 1, 8]} />
```

### Plane Geometry (Ground, walls)

```tsx
// Three.js
import { PlaneGeometry } from 'three'
const geometry = new PlaneGeometry(width, height)

// React Three Fiber
<planeGeometry args={[10, 10]} />
```

## Advanced Geometries

### Torus Geometry (Magical rings)

```tsx
<torusGeometry args={[1, 0.3, 16, 100]} />
```

### Icosahedron Geometry (Crystals, magical objects)

```tsx
<icosahedronGeometry args={[1, 0]} />
```

### Octahedron Geometry (Gems, magical elements)

```tsx
<octahedronGeometry args={[1, 0]} />
```

### Tetrahedron Geometry (Simple crystals)

```tsx
<tetrahedronGeometry args={[1, 0]} />
```

### Dodecahedron Geometry (Complex magical objects)

```tsx
<dodecahedronGeometry args={[1, 0]} />
```

## Custom Shapes

### Ring Geometry (Magical circles)

```tsx
<ringGeometry args={[0.5, 1, 8, 1]} />
```

### Tube Geometry (Curved paths, branches)

```tsx
// Requires a curve path
const curve = new THREE.CatmullRomCurve3([...points])
<tubeGeometry args={[curve, 20, 0.2, 8, false]} />
```

### Lathe Geometry (Vases, containers)

```tsx
const points = [new Vector2(0, 0), new Vector2(1, 1), ...]
<latheGeometry args={[points]} />
```

## Materials for Primitives

### Standard Materials

```tsx
<meshStandardMaterial
  color={0x4a5c3a}
  roughness={0.8}
  metalness={0.2}
  transparent
  opacity={0.7}
/>
```

### Basic Materials (No lighting)

```tsx
<meshBasicMaterial color={0x4a5c3a} />
```

### Lambert Materials (Simple lighting)

```tsx
<meshLambertMaterial color={0x4a5c3a} />
```

### Phong Materials (Shiny surfaces)

```tsx
<meshPhongMaterial color={0x4a5c3a} shininess={100} specular={0x111111} />
```

## Scene-Specific Primitive Suggestions

### Trees

```tsx
// Tree trunk
<cylinderGeometry args={[0.1, 0.15, 2, 8]} />
<meshStandardMaterial color={0x8B4513} />

// Tree foliage
<sphereGeometry args={[1, 8, 6]} />
<meshStandardMaterial color={0x228B22} />

// Or cone for pine trees
<coneGeometry args={[0.8, 1.5, 8]} />
<meshStandardMaterial color={0x006400} />
```

### Rocks

```tsx
// Boulder
<sphereGeometry args={[1, 6, 4]} />
<meshStandardMaterial color={0x696969} roughness={0.9} />

// Jagged rock
<icosahedronGeometry args={[1, 0]} />
<meshStandardMaterial color={0x708090} />
```

### Magical Elements

```tsx
// Crystal
<octahedronGeometry args={[0.5, 0]} />
<meshStandardMaterial
  color={0x9370DB}
  transparent
  opacity={0.8}
  emissive={0x4B0082}
/>

// Magic circle
<ringGeometry args={[0.8, 1, 32]} />
<meshBasicMaterial
  color={0xFFD700}
  transparent
  opacity={0.6}
/>
```

### Structures

```tsx
// Pillar
<cylinderGeometry args={[0.3, 0.3, 3, 8]} />
<meshStandardMaterial color={0xA0A0A0} />

// Wall section
<boxGeometry args={[2, 3, 0.2]} />
<meshStandardMaterial color={0x8B7D6B} />
```

## Implementation Examples

### Enhanced Tree Primitive

```tsx
function TreePrimitive({ size = 1 }: { size?: number }) {
  return (
    <group>
      {/* Trunk */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.1 * size, 0.15 * size, 1.5 * size, 8]} />
        <meshStandardMaterial color={0x8b4513} roughness={0.8} />
      </mesh>

      {/* Foliage */}
      <mesh position={[0, 1.2 * size, 0]}>
        <sphereGeometry args={[0.8 * size, 8, 6]} />
        <meshStandardMaterial color={0x228b22} roughness={0.7} />
      </mesh>
    </group>
  )
}
```

### Rock Formation Primitive

```tsx
function RockFormation() {
  return (
    <group>
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0.1]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={0x696969} roughness={0.9} />
      </mesh>
      <mesh position={[0.5, 0.3, 0.3]} rotation={[0.2, 0.5, 0]}>
        <sphereGeometry args={[0.6, 6, 4]} />
        <meshStandardMaterial color={0x708090} roughness={0.8} />
      </mesh>
    </group>
  )
}
```

## Performance Considerations

### LOD (Level of Detail)

```tsx
import { LOD } from 'three'

// High detail for close viewing
const highDetail = new SphereGeometry(1, 32, 32)
// Low detail for distant viewing
const lowDetail = new SphereGeometry(1, 8, 6)
```

### Instanced Geometries

```tsx
// For many similar objects (like forest trees)
<instancedMesh args={[geometry, material, count]}>
  <sphereGeometry args={[1, 8, 6]} />
  <meshStandardMaterial color={0x228b22} />
</instancedMesh>
```
