import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BufferAttribute,
  AdditiveBlending,
  Points,
  PointsMaterial,
  LineSegments,
  LineBasicMaterial,
  BufferGeometry,
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
  const lineGeomRef = useRef<BufferGeometry>(null)
  const cooldowns = useMemo(
    () =>
      particles.type === 'shooting-star'
        ? new Float32Array(particles.count)
        : null,
    [particles.type, particles.count]
  )

  // Debug shooting stars
  if (particles.type === 'shooting-star') {
    console.log('🌟 ShootingStar ParticleRenderer created:', {
      particleId: particles.id,
      count: particles.count,
      position: particles.position,
      area: particles.area,
      speed: particles.speed,
      color: particles.color,
      opacity: particles.opacity,
      size: particles.size,
    })
  }

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
        case 'stars':
          velocities[i3] = 0
          velocities[i3 + 1] = 0
          velocities[i3 + 2] = 0
          break
        case 'shooting-star':
          // Start all shooting stars visible and moving with varied directions
          positions[i3] =
            particles.position.x + (Math.random() - 0.5) * particles.area.x
          positions[i3 + 1] =
            particles.position.y + (Math.random() - 0.5) * particles.area.y
          positions[i3 + 2] =
            particles.position.z + (Math.random() - 0.5) * particles.area.z

          // Varied directions for shooting stars (reduced speed)
          const direction = Math.random()
          if (direction < 0.25) {
            // Top-right to bottom-left
            velocities[i3] =
              -particles.speed * 0.3 * (0.8 + Math.random() * 0.4)
            velocities[i3 + 1] =
              -particles.speed * 0.3 * (0.6 + Math.random() * 0.4)
          } else if (direction < 0.5) {
            // Top-left to bottom-right
            velocities[i3] = particles.speed * 0.3 * (0.8 + Math.random() * 0.4)
            velocities[i3 + 1] =
              -particles.speed * 0.3 * (0.6 + Math.random() * 0.4)
          } else if (direction < 0.75) {
            // Left to right
            velocities[i3] = particles.speed * 0.3 * (1.0 + Math.random() * 0.5)
            velocities[i3 + 1] =
              -particles.speed * 0.3 * (0.2 + Math.random() * 0.3)
          } else {
            // Right to left
            velocities[i3] =
              -particles.speed * 0.3 * (1.0 + Math.random() * 0.5)
            velocities[i3 + 1] =
              -particles.speed * 0.3 * (0.2 + Math.random() * 0.3)
          }
          velocities[i3 + 2] = 0

          // Set initial delays for staggered appearance
          if (cooldowns) {
            cooldowns[i] = Math.random() * 5 // Random delay 0-5 seconds
          }
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
    // Debug for ALL particle types to see if useFrame is working
    if (
      Math.floor(state.clock.elapsedTime * 2) % 10 === 0 &&
      Math.floor(state.clock.elapsedTime * 20) % 20 === 0
    ) {
      console.log(
        '🔄 useFrame running for:',
        particles.type,
        'delta:',
        delta.toFixed(3)
      )
    }

    // Debug shooting stars specifically
    if (particles.type === 'shooting-star') {
      console.log(
        '🌟 Shooting star useFrame running, count:',
        count,
        'delta:',
        delta.toFixed(3)
      )
      const visibleStars = cooldowns
        ? Array.from(cooldowns).filter(cd => cd <= 0).length
        : 0
      console.log(
        '🌟 Visible stars:',
        visibleStars,
        'hidden stars:',
        particles.count - visibleStars
      )
    }

    // Update particle positions
    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      if (particles.type === 'shooting-star') {
        if (cooldowns && cooldowns[i] > 0) {
          // Hide during cooldown
          cooldowns[i] -= delta
          positions[i3] = 100000
          positions[i3 + 1] = 100000
          positions[i3 + 2] = 0
        } else {
          // Move the shooting star
          positions[i3] += velocities[i3] * delta
          positions[i3 + 1] += velocities[i3 + 1] * delta
          positions[i3 + 2] += velocities[i3 + 2] * delta

          // Reset if out of bounds - new star appears within 1-5 seconds
          if (
            positions[i3] < -1000 ||
            positions[i3 + 1] < -1000 ||
            positions[i3] > 1000 ||
            positions[i3 + 1] > 1000
          ) {
            // Reset to new starting position within camera view
            positions[i3] = (Math.random() - 0.5) * 400 // -200 to 200
            positions[i3 + 1] = (Math.random() - 0.5) * 400 // -200 to 200
            positions[i3 + 2] = 0

            // Regenerate velocity for new direction
            const direction = Math.random()
            if (direction < 0.25) {
              velocities[i3] =
                -particles.speed * 0.3 * (0.8 + Math.random() * 0.4)
              velocities[i3 + 1] =
                -particles.speed * 0.3 * (0.6 + Math.random() * 0.4)
            } else if (direction < 0.5) {
              velocities[i3] =
                particles.speed * 0.3 * (0.8 + Math.random() * 0.4)
              velocities[i3 + 1] =
                -particles.speed * 0.3 * (0.6 + Math.random() * 0.4)
            } else if (direction < 0.75) {
              velocities[i3] =
                particles.speed * 0.3 * (1.0 + Math.random() * 0.5)
              velocities[i3 + 1] =
                -particles.speed * 0.3 * (0.2 + Math.random() * 0.3)
            } else {
              velocities[i3] =
                -particles.speed * 0.3 * (1.0 + Math.random() * 0.5)
              velocities[i3 + 1] =
                -particles.speed * 0.3 * (0.2 + Math.random() * 0.3)
            }

            // Set cooldown for next appearance (1-5 seconds)
            if (cooldowns) {
              cooldowns[i] = 1 + Math.random() * 4
            }
          }
        }
      } else {
        positions[i3] += velocities[i3] * delta
        positions[i3 + 1] += velocities[i3 + 1] * delta
        positions[i3 + 2] += velocities[i3 + 2] * delta
      }

      // Wrap particles around for continuous effect (excluding stars and shooting stars)
      if (particles.type !== 'stars' && particles.type !== 'shooting-star') {
        if (positions[i3] > particles.position.x + particles.area.x / 2)
          positions[i3] = particles.position.x - particles.area.x / 2
        if (positions[i3] < particles.position.x - particles.area.x / 2)
          positions[i3] = particles.position.x + particles.area.x / 2
        if (positions[i3 + 1] > particles.position.y + particles.area.y / 2)
          positions[i3 + 1] = particles.position.y - particles.area.y / 2
        if (positions[i3 + 1] < particles.position.y - particles.area.y / 2)
          positions[i3 + 1] = particles.position.y + particles.area.y / 2
        if (positions[i3 + 2] > particles.position.z + particles.area.z / 2)
          positions[i3 + 2] = particles.position.z - particles.area.z / 2
        if (positions[i3 + 2] < particles.position.z - particles.area.z / 2)
          positions[i3 + 2] = particles.position.z + particles.area.z / 2
      }
    }

    // Update geometry based on particle type
    if (particles.type === 'shooting-star' && lineGeomRef.current) {
      // Update line segments for shooting stars
      const segs = new Float32Array(count * 2 * 3)
      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        const segStart = i * 6
        segs[segStart] = positions[i3]
        segs[segStart + 1] = positions[i3 + 1]
        segs[segStart + 2] = positions[i3 + 2]
        segs[segStart + 3] = positions[i3] - velocities[i3] * 0.15
        segs[segStart + 4] = positions[i3 + 1] - velocities[i3 + 1] * 0.15
        segs[segStart + 5] = positions[i3 + 2] - velocities[i3 + 2] * 0.15
      }
      lineGeomRef.current.setAttribute('position', new BufferAttribute(segs, 3))
      lineGeomRef.current.attributes.position.needsUpdate = true
    } else if (pointsRef.current) {
      // Update points geometry for other particle types
      const geometry = pointsRef.current.geometry
      const positionAttribute = geometry.getAttribute(
        'position'
      ) as BufferAttribute
      positionAttribute.set(positions)
      positionAttribute.needsUpdate = true
    }

    // Animate fireflies opacity for pulsing effect
    if (particles.type === 'fireflies' && materialRef.current) {
      materialRef.current.opacity =
        opacity *
        (0.5 + Math.sin(state.clock.elapsedTime * 2 + Math.random() * 10) * 0.5)
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
      case 'shooting-star':
        return {
          color: '#ffffff',
          size: size * 2.5,
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

  return particles.type === 'shooting-star' ? (
    <lineSegments userData={{ particleId: particles.id }}>
      <bufferGeometry ref={lineGeomRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[
            (() => {
              // Initialize line segments
              const segs = new Float32Array(count * 2 * 3)
              for (let i = 0; i < count; i++) {
                const i3 = i * 3
                const segStart = i * 6
                segs[segStart] = positions[i3]
                segs[segStart + 1] = positions[i3 + 1]
                segs[segStart + 2] = positions[i3 + 2]
                segs[segStart + 3] = positions[i3] - velocities[i3] * 0.15
                segs[segStart + 4] =
                  positions[i3 + 1] - velocities[i3 + 1] * 0.15
                segs[segStart + 5] =
                  positions[i3 + 2] - velocities[i3 + 2] * 0.15
              }
              return segs
            })(),
            3,
          ]}
          count={count * 2}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={materialProps.color}
        linewidth={4}
        transparent={true}
        opacity={materialProps.opacity}
        blending={AdditiveBlending}
      />
    </lineSegments>
  ) : (
    <points ref={pointsRef} userData={{ particleId: particles.id }}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial ref={materialRef} {...materialProps} />
    </points>
  )
}
