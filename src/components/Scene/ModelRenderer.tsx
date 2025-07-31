// Props interface for ModelRenderer
interface ModelRendererProps {
  model: ModelConfig
  modifiers: ModifierState
  currentTime: number
  wallDirection: 'north' | 'south' | 'east' | 'west'
}
// Minimal PrimitiveModelRenderer for primitives
function PrimitiveModelRenderer({
  model,
  wallDirection,
}: {
  model: ModelConfig
  wallDirection: 'north' | 'south' | 'east' | 'west'
}) {
  const groupRef = useRef<Group>(null)
  const primitiveMesh = useMemo(
    () => createEnhancedFallback(model.id, 1),
    [model.id]
  )
  const position = useMemo(() => {
    let pos = [model.position.x, model.position.y, model.position.z]
    switch (wallDirection) {
      case 'south':
        pos[0] = -pos[0]
        break
      case 'east':
        pos = [-pos[2], pos[1], pos[0]]
        break
      case 'west':
        pos = [pos[2], pos[1], -pos[0]]
        break
    }
    return pos as [number, number, number]
  }, [model.position, wallDirection])
  const scale = useMemo(
    () =>
      [model.scale.x, model.scale.y, model.scale.z] as [number, number, number],
    [model.scale]
  )
  const rotation = useMemo(() => {
    if (
      model.rotation &&
      typeof model.rotation.x === 'number' &&
      typeof model.rotation.y === 'number' &&
      typeof model.rotation.z === 'number'
    ) {
      return [model.rotation.x, model.rotation.y, model.rotation.z] as [
        number,
        number,
        number,
      ]
    }
    return [0, 0, 0] as [number, number, number]
  }, [model.rotation])
  return (
    <group
      ref={groupRef}
      position={position}
      scale={scale}
      rotation={rotation}
      name={`model-${model.id}`}
      castShadow={model.castShadow}
      receiveShadow={model.receiveShadow}
    >
      {primitiveMesh}
    </group>
  )
}
import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { Group } from 'three'
import { ModelConfig, ModifierState } from '@/types/scene'
import { createEnhancedFallback } from './PrimitiveComponents'

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

// Component for handling primitive geometries
export default function ModelRenderer(props: ModelRendererProps) {
  const { model, modifiers, currentTime, wallDirection } = props
  const groupRef = useRef<Group>(null)
  const isPrimitive = model.src.startsWith('primitive:')
  const primitiveType = isPrimitive ? model.src.replace('primitive:', '') : null
  // Always call hooks at the top level
  const { scene, animations, error } = useSafeGLTF(model.src)
  const { actions } = useAnimations(animations || [], groupRef)
  const fallbackMesh = useMemo(() => {
    if (error || !scene) {
      return createEnhancedFallback(model.id, 1)
    }
    return null
  }, [error, scene, model.id])

  // Calculate position based on modifiers and wall direction
  const position = useMemo(() => {
    let pos = [model.position.x, model.position.y, model.position.z]
    switch (wallDirection) {
      case 'north':
        break
      case 'south':
        pos[0] = -pos[0]
        break
      case 'east':
        pos = [-pos[2], pos[1], pos[0]]
        break
      case 'west':
        pos = [pos[2], pos[1], -pos[0]]
        break
    }
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
    let rot: [number, number, number] = [0, 0, 0]
    if (
      model.rotation &&
      typeof model.rotation.x === 'number' &&
      typeof model.rotation.y === 'number' &&
      typeof model.rotation.z === 'number'
    ) {
      rot = [model.rotation.x, model.rotation.y, model.rotation.z]
    }
    switch (wallDirection) {
      case 'north':
        break
      case 'south':
        rot[1] += Math.PI
        break
      case 'east':
        rot[1] += Math.PI / 2
        break
      case 'west':
        rot[1] -= Math.PI / 2
        break
    }
    Object.entries(modifiers).forEach(([modifierId, value]) => {
      if (modifierId === `${model.id}_rot_x`) {
        rot[0] = Number(value) || rot[0]
      } else if (modifierId === `${model.id}_rot_y`) {
        rot[1] = Number(value) || rot[1]
      } else if (modifierId === `${model.id}_rot_z`) {
        rot[2] = Number(value) || rot[2]
      }
    })
    return rot
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
      model.animations.forEach((animName: string) => {
        const action = actions[animName as keyof typeof actions]
        if (action) {
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

  if (isPrimitive) {
    return (
      <PrimitiveModelRenderer model={model} wallDirection={wallDirection} />
    )
  }

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
        fallbackMesh
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
