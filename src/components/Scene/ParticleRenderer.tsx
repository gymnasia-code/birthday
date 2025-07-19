import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Points,
  PointsMaterial,
  BufferAttribute,
  AdditiveBlending,
} from 'three'
import { ParticleConfig, ModifierState } from '@/types/scene'

interface ParticleRendererProps {
  particles: ParticleConfig
  modifiers: ModifierState
  currentTime: number
  layerOpacity: number
}

export default function ParticleRenderer({
  particles,
  modifiers,
  currentTime,
  layerOpacity,
}: ParticleRendererProps) {
  const pointsRef = useRef<Points>(null)
  const materialRef = useRef<PointsMaterial>(null)

  // Generate particle positions
  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(particles.count * 3)
    const velocities = new Float32Array(particles.count * 3)

    for (let i = 0; i < particles.count; i++) {
      const i3 = i * 3

      // Random position within area
      positions[i3] =
        particles.position.x + (Math.random() - 0.5) * particles.area.x
      positions[i3 + 1] =
        particles.position.y + (Math.random() - 0.5) * particles.area.y
      positions[i3 + 2] =
        particles.position.z + (Math.random() - 0.5) * particles.area.z

      // Set velocities based on particle type
      switch (particles.type) {
        case 'fog':
          velocities[i3] = (Math.random() - 0.5) * 0.1
          velocities[i3 + 1] = Math.random() * 0.05
          velocities[i3 + 2] = (Math.random() - 0.5) * 0.1
          break
        case 'rain':
          velocities[i3] = (Math.random() - 0.5) * 0.1
          velocities[i3 + 1] = -particles.speed - Math.random() * 2
          velocities[i3 + 2] = (Math.random() - 0.5) * 0.1
          break
        case 'snow':
          velocities[i3] = (Math.random() - 0.5) * 0.2
          velocities[i3 + 1] = -particles.speed * 0.3 - Math.random() * 0.5
          velocities[i3 + 2] = (Math.random() - 0.5) * 0.2
          break
        case 'leaves':
          velocities[i3] = (Math.random() - 0.5) * 0.5
          velocities[i3 + 1] = -particles.speed * 0.5 - Math.random() * 0.3
          velocities[i3 + 2] = (Math.random() - 0.5) * 0.5
          break
        case 'fireflies':
          velocities[i3] = (Math.random() - 0.5) * 0.3
          velocities[i3 + 1] = (Math.random() - 0.5) * 0.2
          velocities[i3 + 2] = (Math.random() - 0.5) * 0.3
          break
        default:
          velocities[i3] = (Math.random() - 0.5) * particles.speed
          velocities[i3 + 1] = (Math.random() - 0.5) * particles.speed
          velocities[i3 + 2] = (Math.random() - 0.5) * particles.speed
      }
    }

    return { positions, velocities }
  }, [particles])

  // Calculate opacity based on modifiers
  const opacity = useMemo(() => {
    let finalOpacity = particles.opacity * layerOpacity

    Object.entries(modifiers).forEach(([modifierId, value]) => {
      if (modifierId === `${particles.id}_opacity`) {
        finalOpacity = Number(value) || finalOpacity
      }
    })

    return Math.max(0, Math.min(1, finalOpacity))
  }, [particles.opacity, particles.id, modifiers, layerOpacity])

  // Calculate size based on modifiers
  const size = useMemo(() => {
    let finalSize = particles.size

    Object.entries(modifiers).forEach(([modifierId, value]) => {
      if (modifierId === `${particles.id}_size`) {
        finalSize = Number(value) || finalSize
      }
    })

    return finalSize
  }, [particles.size, particles.id, modifiers])

  // Calculate count based on modifiers
  const count = useMemo(() => {
    let finalCount = particles.count

    Object.entries(modifiers).forEach(([modifierId, value]) => {
      if (modifierId === `${particles.id}_count`) {
        finalCount = Number(value) || finalCount
      }
    })

    return Math.max(0, Math.min(particles.count, finalCount))
  }, [particles.count, particles.id, modifiers])

  // Animation
  useFrame((state, delta) => {
    if (pointsRef.current) {
      const geometry = pointsRef.current.geometry
      const positionAttribute = geometry.getAttribute(
        'position'
      ) as BufferAttribute

      for (let i = 0; i < count; i++) {
        const i3 = i * 3

        // Update positions based on velocities
        positionAttribute.array[i3] += velocities[i3] * delta
        positionAttribute.array[i3 + 1] += velocities[i3 + 1] * delta
        positionAttribute.array[i3 + 2] += velocities[i3 + 2] * delta

        // Boundary checking and reset
        const x = positionAttribute.array[i3]
        const y = positionAttribute.array[i3 + 1]
        const z = positionAttribute.array[i3 + 2]

        // Reset particles that go out of bounds
        if (
          Math.abs(x - particles.position.x) > particles.area.x / 2 ||
          Math.abs(y - particles.position.y) > particles.area.y / 2 ||
          Math.abs(z - particles.position.z) > particles.area.z / 2
        ) {
          // Reset to random position within area
          positionAttribute.array[i3] =
            particles.position.x + (Math.random() - 0.5) * particles.area.x
          positionAttribute.array[i3 + 1] =
            particles.position.y + (Math.random() - 0.5) * particles.area.y
          positionAttribute.array[i3 + 2] =
            particles.position.z + (Math.random() - 0.5) * particles.area.z
        }

        // Special behavior for fireflies
        if (particles.type === 'fireflies') {
          const time = currentTime * 2
          const flutter = Math.sin(time + i * 0.1) * 0.1
          positionAttribute.array[i3] += flutter
          positionAttribute.array[i3 + 1] += Math.cos(time + i * 0.15) * 0.05
        }
      }

      positionAttribute.needsUpdate = true
    }

    // Update material opacity for fireflies blinking
    if (materialRef.current && particles.type === 'fireflies') {
      const blink = Math.sin(currentTime * 5) * 0.3 + 0.7
      materialRef.current.opacity = opacity * blink
    }
  })

  // Material properties based on particle type
  const materialProps = useMemo(() => {
    switch (particles.type) {
      case 'fog':
        return {
          color: `rgb(${Math.floor(particles.color.r * 255)}, ${Math.floor(particles.color.g * 255)}, ${Math.floor(particles.color.b * 255)})`,
          size: size * 3,
          transparent: true,
          opacity: opacity * 0.3,
          blending: AdditiveBlending,
        }
      case 'fireflies':
        return {
          color: '#fff8cc', // Warm yellow
          size: size * 0.5,
          transparent: true,
          opacity: opacity,
          blending: AdditiveBlending,
        }
      default:
        return {
          color: `rgb(${Math.floor(particles.color.r * 255)}, ${Math.floor(particles.color.g * 255)}, ${Math.floor(particles.color.b * 255)})`,
          size: size,
          transparent: true,
          opacity: opacity,
        }
    }
  }, [particles.type, particles.color, size, opacity])

  return (
    <points ref={pointsRef} userData={{ particleId: particles.id }}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        {...materialProps}
        sizeAttenuation={true}
        vertexColors={false}
      />
    </points>
  )
}
