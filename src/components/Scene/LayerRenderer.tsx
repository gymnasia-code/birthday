import React, { useMemo } from 'react'
import { LayerConfig, ModifierState } from '@/types/scene'
import ModelRenderer from './ModelRenderer'
import LightRenderer from './LightRenderer'
import ParticleRenderer from './ParticleRenderer'

interface LayerRendererProps {
  layer: LayerConfig
  modifiers: ModifierState
  currentTime: number
  wallDirection: 'north' | 'south' | 'east' | 'west'
}

export default function LayerRenderer({
  layer,
  modifiers,
  currentTime,
  wallDirection,
}: LayerRendererProps) {
  // Calculate layer visibility based on modifiers
  const isVisible = useMemo(() => {
    let visible = layer.visible

    // Check if any modifiers affect this layer's visibility
    Object.entries(modifiers).forEach(([modifierId, value]) => {
      // Example modifier logic - customize based on your needs
      if (modifierId === `show_${layer.id}`) {
        visible = Boolean(value)
      } else if (modifierId === `hide_${layer.id}`) {
        visible = !Boolean(value)
      }
    })

    return visible
  }, [layer.visible, layer.id, modifiers])

  // Calculate layer opacity based on modifiers
  const opacity = useMemo(() => {
    let finalOpacity = layer.opacity

    // Check for opacity modifiers
    Object.entries(modifiers).forEach(([modifierId, value]) => {
      if (modifierId === `${layer.id}_opacity`) {
        finalOpacity = Number(value) || layer.opacity
      }
    })

    return Math.max(0, Math.min(1, finalOpacity))
  }, [layer.opacity, layer.id, modifiers])

  if (!isVisible) {
    return null
  }

  return (
    <group
      name={`layer-${layer.id}`}
      userData={{ layerId: layer.id, wallDirection }}
      renderOrder={layer.renderOrder}
    >
      {/* Render Models */}
      {layer.models?.map(model => (
        <ModelRenderer
          key={model.id}
          model={model}
          modifiers={modifiers}
          currentTime={currentTime}
          wallDirection={wallDirection}
        />
      ))}

      {/* Render Lights */}
      {layer.lights?.map(light => (
        <LightRenderer
          key={light.id}
          light={light}
          modifiers={modifiers}
          currentTime={currentTime}
          layerOpacity={opacity}
        />
      ))}

      {/* Render Particles */}
      {layer.particles?.map(particles => {
        if (particles.type === 'shooting-star') {
          console.log('🌟 LayerRenderer rendering shooting star:', {
            layerId: layer.id,
            particleId: particles.id,
            layerVisible: isVisible,
            layerOpacity: opacity,
            particleOpacity: particles.opacity,
          })
        }
        return (
          <ParticleRenderer
            key={particles.id}
            particles={particles}
            modifiers={modifiers}
            currentTime={currentTime}
            layerOpacity={opacity}
          />
        )
      })}
    </group>
  )
}
