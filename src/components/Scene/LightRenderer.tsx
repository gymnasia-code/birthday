import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { LightConfig, ModifierState } from '@/types/scene'
import { DirectionalLight, PointLight, SpotLight, AmbientLight } from 'three'

interface LightRendererProps {
  light: LightConfig
  modifiers: ModifierState
  currentTime: number
  layerOpacity: number
}

export default function LightRenderer({
  light,
  modifiers,
  currentTime,
  layerOpacity,
}: LightRendererProps) {
  const lightRef = useRef<
    DirectionalLight | PointLight | SpotLight | AmbientLight
  >(null)

  // Calculate color based on modifiers
  const color = useMemo(() => {
    let r = light.color.r
    let g = light.color.g
    let b = light.color.b

    Object.entries(modifiers).forEach(([modifierId, value]) => {
      if (modifierId === `${light.id}_color_r`) {
        r = Number(value) || r
      } else if (modifierId === `${light.id}_color_g`) {
        g = Number(value) || g
      } else if (modifierId === `${light.id}_color_b`) {
        b = Number(value) || b
      }
    })

    return [r, g, b] as [number, number, number]
  }, [light.color, light.id, modifiers])

  // Calculate intensity based on modifiers
  const intensity = useMemo(() => {
    let finalIntensity = light.intensity * layerOpacity

    Object.entries(modifiers).forEach(([modifierId, value]) => {
      if (modifierId === `${light.id}_intensity`) {
        finalIntensity = Number(value) || finalIntensity
      }
    })

    return finalIntensity
  }, [light.intensity, light.id, modifiers, layerOpacity])

  // Calculate position based on modifiers
  const position = useMemo(() => {
    if (!light.position) return undefined

    const pos = [light.position.x, light.position.y, light.position.z]

    Object.entries(modifiers).forEach(([modifierId, value]) => {
      if (modifierId === `${light.id}_x`) {
        pos[0] = Number(value) || pos[0]
      } else if (modifierId === `${light.id}_y`) {
        pos[1] = Number(value) || pos[1]
      } else if (modifierId === `${light.id}_z`) {
        pos[2] = Number(value) || pos[2]
      }
    })

    return pos as [number, number, number]
  }, [light.position, light.id, modifiers])

  // Animation updates
  useFrame(() => {
    if (lightRef.current) {
      // Apply time-based animations based on modifiers
      Object.entries(modifiers).forEach(([modifierId, value]) => {
        if (modifierId === `${light.id}_flicker`) {
          if (value) {
            const flickerAmount =
              Number(modifiers[`${light.id}_flicker_amount`]) || 0.2
            const baseIntensity = intensity
            lightRef.current!.intensity =
              baseIntensity + (Math.random() - 0.5) * flickerAmount
          }
        } else if (modifierId === `${light.id}_pulse`) {
          if (value) {
            const pulseSpeed = Number(modifiers[`${light.id}_pulse_speed`]) || 2
            const pulseAmount =
              Number(modifiers[`${light.id}_pulse_amount`]) || 0.5
            const baseIntensity = intensity
            lightRef.current!.intensity =
              baseIntensity + Math.sin(currentTime * pulseSpeed) * pulseAmount
          }
        }
      })
    }
  })

  // Render different light types
  switch (light.type) {
    case 'ambient':
      return (
        <ambientLight
          ref={lightRef as React.RefObject<AmbientLight>}
          color={color}
          intensity={intensity}
        />
      )

    case 'directional':
      return (
        <directionalLight
          ref={lightRef as React.RefObject<DirectionalLight>}
          color={color}
          intensity={intensity}
          position={position}
          castShadow={light.castShadow}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
      )

    case 'point':
      return (
        <pointLight
          ref={lightRef as React.RefObject<PointLight>}
          color={color}
          intensity={intensity}
          position={position}
          distance={light.distance || 0}
          castShadow={light.castShadow}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
      )

    case 'spot':
      return (
        <spotLight
          ref={lightRef as React.RefObject<SpotLight>}
          color={color}
          intensity={intensity}
          position={position}
          angle={light.angle || Math.PI / 4}
          penumbra={light.penumbra || 0}
          distance={light.distance || 0}
          castShadow={light.castShadow}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
      )

    default:
      return null
  }
}
