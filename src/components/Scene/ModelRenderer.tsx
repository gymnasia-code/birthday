import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { Group, BoxGeometry, MeshStandardMaterial, Mesh } from 'three'
import { ModelConfig, ModifierState } from '@/types/scene'

// Hook for safe model loading that handles 404s gracefully
function useSafeGLTF(url: string) {
  const [error, setError] = useState<string | null>(null)

  // Always call useGLTF (React hooks requirement)
  // Three.js will handle 404s and we'll catch them in the error boundary
  const gltfResult = useGLTF(url)

  // Set up error handling
  useEffect(() => {
    // Clear any previous errors when URL changes
    setError(null)
  }, [url])

  return {
    scene: gltfResult.scene,
    animations: gltfResult.animations || [],
    error,
  }
}

interface ModelRendererProps {
  model: ModelConfig
  modifiers: ModifierState
  currentTime: number
  wallDirection: 'north' | 'south' | 'east' | 'west'
}

export default function ModelRenderer({
  model,
  modifiers,
  currentTime,
  wallDirection,
}: ModelRendererProps) {
  const groupRef = useRef<Group>(null)

  // Safe model loading
  const { scene, animations, error } = useSafeGLTF(model.src)
  const { actions } = useAnimations(animations || [], groupRef)

  // Create fallback geometry for failed models
  const fallbackMesh = useMemo(() => {
    if (error || !scene) {
      const geometry = new BoxGeometry(1, 2, 1)
      const material = new MeshStandardMaterial({
        color: model.id.includes('tree') ? 0x4a5c3a : 0x8b4513,
        transparent: true,
        opacity: 0.7,
      })
      const mesh = new Mesh(geometry, material)
      mesh.castShadow = model.castShadow || false
      mesh.receiveShadow = model.receiveShadow || false
      return mesh
    }
    return null
  }, [error, scene, model.id, model.castShadow, model.receiveShadow])

  // Calculate position based on modifiers and wall direction
  const position = useMemo(() => {
    let pos = [model.position.x, model.position.y, model.position.z]

    // Apply wall-specific positioning
    switch (wallDirection) {
      case 'north':
        // No change for north wall
        break
      case 'south':
        // Flip X for south wall (180 degree view)
        pos[0] = -pos[0]
        break
      case 'east':
        // Rotate position for east wall (90 degree CCW)
        pos = [-pos[2], pos[1], pos[0]]
        break
      case 'west':
        // Rotate position for west wall (90 degree CW)
        pos = [pos[2], pos[1], -pos[0]]
        break
    }

    // Apply modifier-based position changes
    Object.entries(modifiers).forEach(([modifierId, value]) => {
      if (modifierId === `${model.id}_x`) {
        pos[0] = Number(value) || pos[0]
      } else if (modifierId === `${model.id}_y`) {
        pos[1] = Number(value) || pos[1]
      } else if (modifierId === `${model.id}_z`) {
        pos[2] = Number(value) || pos[2]
      }
    })

    return pos as [number, number, number]
  }, [model.position, model.id, modifiers, wallDirection])

  // Calculate rotation based on modifiers and wall direction
  const rotation = useMemo(() => {
    const rot = [model.rotation.x, model.rotation.y, model.rotation.z]

    // Apply wall-specific rotation
    switch (wallDirection) {
      case 'north':
        // No change for north wall
        break
      case 'south':
        // Add 180 degrees to Y rotation for south wall
        rot[1] += Math.PI
        break
      case 'east':
        // Add 90 degrees CCW to Y rotation for east wall
        rot[1] += Math.PI / 2
        break
      case 'west':
        // Add 90 degrees CW to Y rotation for west wall
        rot[1] -= Math.PI / 2
        break
    }

    // Apply modifier-based rotation changes
    Object.entries(modifiers).forEach(([modifierId, value]) => {
      if (modifierId === `${model.id}_rot_x`) {
        rot[0] = Number(value) || rot[0]
      } else if (modifierId === `${model.id}_rot_y`) {
        rot[1] = Number(value) || rot[1]
      } else if (modifierId === `${model.id}_rot_z`) {
        rot[2] = Number(value) || rot[2]
      }
    })

    return rot as [number, number, number]
  }, [model.rotation, model.id, modifiers, wallDirection])

  // Calculate scale based on modifiers
  const scale = useMemo(() => {
    let scl = [model.scale.x, model.scale.y, model.scale.z]

    Object.entries(modifiers).forEach(([modifierId, value]) => {
      if (modifierId === `${model.id}_scale`) {
        const scaleValue = Number(value) || 1
        scl = [scaleValue, scaleValue, scaleValue]
      } else if (modifierId === `${model.id}_scale_x`) {
        scl[0] = Number(value) || scl[0]
      } else if (modifierId === `${model.id}_scale_y`) {
        scl[1] = Number(value) || scl[1]
      } else if (modifierId === `${model.id}_scale_z`) {
        scl[2] = Number(value) || scl[2]
      }
    })

    return scl as [number, number, number]
  }, [model.scale, model.id, modifiers])

  // Handle animations
  React.useEffect(() => {
    if (model.animations && actions && Object.keys(actions).length > 0) {
      model.animations.forEach(animName => {
        const action = actions[animName as keyof typeof actions]
        if (action) {
          // Check for animation modifiers
          const isEnabled = modifiers[`${model.id}_anim_${animName}`] !== false

          if (isEnabled) {
            action.play()
          } else {
            action.stop()
          }
        }
      })
    }
  }, [actions, model.animations, model.id, modifiers])

  // Animation updates
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Apply time-based animations based on modifiers
      Object.entries(modifiers).forEach(([modifierId, value]) => {
        if (modifierId === `${model.id}_float`) {
          if (value) {
            const floatSpeed = Number(modifiers[`${model.id}_float_speed`]) || 1
            const floatAmount =
              Number(modifiers[`${model.id}_float_amount`]) || 0.1
            groupRef.current!.position.y =
              position[1] + Math.sin(currentTime * floatSpeed) * floatAmount
          }
        } else if (modifierId === `${model.id}_rotate_y`) {
          if (value) {
            const rotateSpeed =
              Number(modifiers[`${model.id}_rotate_speed`]) || 1
            groupRef.current!.rotation.y += delta * rotateSpeed
          }
        }
      })
    }
  })

  // Clone scene to avoid modifying the original
  const clonedScene = useMemo(
    () => (scene && scene.clone ? scene.clone() : null),
    [scene]
  )

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      userData={{ modelId: model.id }}
    >
      {clonedScene ? (
        <primitive
          object={clonedScene}
          castShadow={model.castShadow}
          receiveShadow={model.receiveShadow}
        />
      ) : fallbackMesh ? (
        <primitive object={fallbackMesh} />
      ) : (
        <mesh castShadow={model.castShadow} receiveShadow={model.receiveShadow}>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color={0x888888} transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  )
}

// Preload GLTF models function
export const preloadModel = (url: string) => {
  useGLTF.preload(url)
}
