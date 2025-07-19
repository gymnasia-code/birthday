import React from 'react'

// Enhanced primitive components for better fallbacks
export function TreePrimitive({
  type = 'oak',
  size = 1,
}: {
  type?: 'oak' | 'pine' | 'birch'
  size?: number
}) {
  if (type === 'pine') {
    return (
      <group>
        {/* Pine trunk */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.08 * size, 0.12 * size, 1.8 * size, 8]} />
          <meshStandardMaterial color={0x8b4513} roughness={0.8} />
        </mesh>

        {/* Pine foliage - cone shape */}
        <mesh position={[0, 1.4 * size, 0]}>
          <coneGeometry args={[0.6 * size, 1.2 * size, 8]} />
          <meshStandardMaterial color={0x006400} roughness={0.7} />
        </mesh>
      </group>
    )
  }

  if (type === 'birch') {
    return (
      <group>
        {/* Birch trunk - thinner, white */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.06 * size, 0.08 * size, 2.2 * size, 8]} />
          <meshStandardMaterial color={0xf5f5dc} roughness={0.6} />
        </mesh>

        {/* Birch foliage - smaller, higher */}
        <mesh position={[0, 1.8 * size, 0]}>
          <sphereGeometry args={[0.6 * size, 8, 6]} />
          <meshStandardMaterial color={0x9acd32} roughness={0.7} />
        </mesh>
      </group>
    )
  }

  // Default oak tree
  return (
    <group>
      {/* Oak trunk */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.12 * size, 0.18 * size, 1.6 * size, 8]} />
        <meshStandardMaterial color={0x8b4513} roughness={0.8} />
      </mesh>

      {/* Oak foliage - fuller, rounder */}
      <mesh position={[0, 1.3 * size, 0]}>
        <sphereGeometry args={[1 * size, 8, 6]} />
        <meshStandardMaterial color={0x228b22} roughness={0.7} />
      </mesh>
    </group>
  )
}

export function RockPrimitive({
  type = 'boulder',
  size = 1,
}: {
  type?: 'boulder' | 'formation' | 'crystal'
  size?: number
}) {
  if (type === 'formation') {
    return (
      <group>
        <mesh position={[0, 0.3 * size, 0]} rotation={[0, 0, 0.1]}>
          <icosahedronGeometry args={[0.8 * size, 0]} />
          <meshStandardMaterial color={0x696969} roughness={0.9} />
        </mesh>
        <mesh
          position={[0.4 * size, 0.5 * size, 0.2 * size]}
          rotation={[0.2, 0.5, 0]}
        >
          <sphereGeometry args={[0.5 * size, 6, 4]} />
          <meshStandardMaterial color={0x708090} roughness={0.8} />
        </mesh>
        <mesh
          position={[-0.3 * size, 0.2 * size, -0.1 * size]}
          rotation={[0.1, -0.3, 0.2]}
        >
          <dodecahedronGeometry args={[0.4 * size, 0]} />
          <meshStandardMaterial color={0x778899} roughness={0.85} />
        </mesh>
      </group>
    )
  }

  if (type === 'crystal') {
    return (
      <mesh position={[0, 0.5 * size, 0]} rotation={[0, Math.PI / 4, 0]}>
        <octahedronGeometry args={[0.6 * size, 0]} />
        <meshStandardMaterial
          color={0x9370db}
          transparent
          opacity={0.8}
          emissive={0x4b0082}
          emissiveIntensity={0.2}
        />
      </mesh>
    )
  }

  // Default boulder
  return (
    <mesh position={[0, 0.4 * size, 0]} rotation={[0.1, 0.3, 0.2]}>
      <sphereGeometry args={[0.8 * size, 6, 4]} />
      <meshStandardMaterial color={0x696969} roughness={0.9} />
    </mesh>
  )
}

export function CreaturePrimitive({
  type = 'spirit',
  size = 1,
}: {
  type?: 'spirit' | 'unicorn' | 'dragon'
  size?: number
}) {
  if (type === 'unicorn') {
    return (
      <group>
        {/* Body */}
        <mesh position={[0, 0.8 * size, 0]}>
          <cylinderGeometry args={[0.3 * size, 0.4 * size, 1.2 * size, 8]} />
          <meshStandardMaterial color={0xf8f8ff} roughness={0.3} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.6 * size, 0.6 * size]}>
          <sphereGeometry args={[0.25 * size, 8, 6]} />
          <meshStandardMaterial color={0xf8f8ff} roughness={0.3} />
        </mesh>

        {/* Horn */}
        <mesh position={[0, 2 * size, 0.8 * size]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.05 * size, 0.4 * size, 8]} />
          <meshStandardMaterial
            color={0xffd700}
            emissive={0xffd700}
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Legs */}
        {[-0.2, 0.2].map((x, i) => (
          <React.Fragment key={i}>
            <mesh position={[x * size, 0.2 * size, 0.3 * size]}>
              <cylinderGeometry
                args={[0.08 * size, 0.08 * size, 0.4 * size, 8]}
              />
              <meshStandardMaterial color={0xf8f8ff} roughness={0.3} />
            </mesh>
            <mesh position={[x * size, 0.2 * size, -0.3 * size]}>
              <cylinderGeometry
                args={[0.08 * size, 0.08 * size, 0.4 * size, 8]}
              />
              <meshStandardMaterial color={0xf8f8ff} roughness={0.3} />
            </mesh>
          </React.Fragment>
        ))}
      </group>
    )
  }

  // Default spirit - floating orb with magical effects
  return (
    <group>
      <mesh position={[0, 1 * size, 0]}>
        <sphereGeometry args={[0.3 * size, 16, 12]} />
        <meshStandardMaterial
          color={0x00ffff}
          transparent
          opacity={0.7}
          emissive={0x0080ff}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Magical ring around spirit */}
      <mesh position={[0, 1 * size, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4 * size, 0.5 * size, 32]} />
        <meshBasicMaterial
          color={0xffd700}
          transparent
          opacity={0.6}
          side={2} // DoubleSide
        />
      </mesh>
    </group>
  )
}

// Enhanced fallback function that determines primitive type
export function createEnhancedFallback(modelId: string, size = 1) {
  const id = modelId.toLowerCase()

  // Handle planets with specific colors
  if (id === 'sun') {
    return (
      <mesh>
        <sphereGeometry args={[1 * size, 16, 12]} />
        <meshStandardMaterial
          color={0xffcc00}
          emissive={0xff6600}
          emissiveIntensity={0.8}
        />
      </mesh>
    )
  }

  if (id === 'mercury') {
    return (
      <mesh>
        <sphereGeometry args={[1 * size, 16, 12]} />
        <meshStandardMaterial
          color={0x8c7853}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
    )
  }

  if (id === 'venus') {
    return (
      <mesh>
        <sphereGeometry args={[1 * size, 16, 12]} />
        <meshStandardMaterial
          color={0xffb649}
          roughness={0.8}
          metalness={0.0}
        />
      </mesh>
    )
  }

  if (id === 'earth') {
    return (
      <mesh>
        <sphereGeometry args={[1 * size, 16, 12]} />
        <meshStandardMaterial
          color={0x6b93d6}
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>
    )
  }

  if (id === 'mars') {
    return (
      <mesh>
        <sphereGeometry args={[1 * size, 16, 12]} />
        <meshStandardMaterial
          color={0xcd5c5c}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
    )
  }

  if (id === 'jupiter') {
    return (
      <mesh>
        <sphereGeometry args={[1 * size, 16, 12]} />
        <meshStandardMaterial
          color={0xd8ca9d}
          roughness={0.6}
          metalness={0.0}
        />
      </mesh>
    )
  }

  if (id === 'saturn') {
    return (
      <mesh>
        <sphereGeometry args={[1 * size, 16, 12]} />
        <meshStandardMaterial
          color={0xfab27b}
          roughness={0.7}
          metalness={0.0}
        />
      </mesh>
    )
  }

  // Handle basic primitive shapes
  if (id === 'sphere') {
    return (
      <mesh>
        <sphereGeometry args={[1 * size, 16, 12]} />
        <meshStandardMaterial color={0xffffff} />
      </mesh>
    )
  }

  if (id === 'cube' || id === 'box') {
    return (
      <mesh>
        <boxGeometry args={[1 * size, 1 * size, 1 * size]} />
        <meshStandardMaterial color={0xffffff} />
      </mesh>
    )
  }

  if (id === 'cylinder') {
    return (
      <mesh>
        <cylinderGeometry args={[1 * size, 1 * size, 2 * size, 16]} />
        <meshStandardMaterial color={0xffffff} />
      </mesh>
    )
  }

  if (id === 'ring') {
    return (
      <mesh>
        <ringGeometry args={[0.8 * size, 1.2 * size, 32]} />
        <meshStandardMaterial color={0xffffff} side={2} />
      </mesh>
    )
  }

  if (id.includes('tree')) {
    if (id.includes('oak')) return <TreePrimitive type="oak" size={size} />
    if (id.includes('pine')) return <TreePrimitive type="pine" size={size} />
    if (id.includes('birch')) return <TreePrimitive type="birch" size={size} />
    return <TreePrimitive type="oak" size={size} />
  }

  if (id.includes('rock') || id.includes('boulder') || id.includes('stone')) {
    if (id.includes('formation'))
      return <RockPrimitive type="formation" size={size} />
    if (id.includes('crystal'))
      return <RockPrimitive type="crystal" size={size} />
    return <RockPrimitive type="boulder" size={size} />
  }

  if (
    id.includes('creature') ||
    id.includes('spirit') ||
    id.includes('unicorn')
  ) {
    if (id.includes('unicorn'))
      return <CreaturePrimitive type="unicorn" size={size} />
    return <CreaturePrimitive type="spirit" size={size} />
  }

  // Default fallback - simple box
  return (
    <mesh>
      <boxGeometry args={[1 * size, 2 * size, 1 * size]} />
      <meshStandardMaterial
        color={0x888888}
        transparent
        opacity={0.5}
        wireframe
      />
    </mesh>
  )
}
