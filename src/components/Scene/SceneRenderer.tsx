import React, { useState, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, Environment } from '@react-three/drei'
import { ProgramConfig, SceneConfig, ModifierState } from '@/types/scene'
import LayerRenderer from './LayerRenderer'
import AudioManager from '../Audio/AudioManager'
import TimelineController from './TimelineController'

interface SceneRendererProps {
  programConfig: ProgramConfig
  sceneConfig: SceneConfig
  wallNumber: number
  modifiers: Record<string, string>
}

export default function SceneRenderer({
  programConfig,
  sceneConfig,
  wallNumber,
  modifiers,
}: SceneRendererProps) {
  const [isPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)

  // Find wall configuration
  const wallConfig = useMemo(() => {
    return sceneConfig.walls.find(wall => wall.id === wallNumber)
  }, [sceneConfig.walls, wallNumber])

  // Parse modifiers to proper types
  const parsedModifiers = useMemo<ModifierState>(() => {
    const parsed: ModifierState = {}

    sceneConfig.modifiers.forEach(modifierDef => {
      const value = modifiers[modifierDef.id]

      if (value !== undefined) {
        switch (modifierDef.type) {
          case 'boolean':
            parsed[modifierDef.id] = value === 'true'
            break
          case 'number':
            parsed[modifierDef.id] = parseFloat(value) || modifierDef.default
            break
          case 'string':
          case 'select':
            parsed[modifierDef.id] = value
            break
          default:
            parsed[modifierDef.id] = modifierDef.default
        }
      } else {
        parsed[modifierDef.id] = modifierDef.default
      }
    })

    return parsed
  }, [modifiers, sceneConfig.modifiers])

  // Filter layers for this wall
  const wallLayers = useMemo(() => {
    if (!wallConfig) return sceneConfig.layers

    if (wallConfig.specificLayers) {
      return sceneConfig.layers.filter(layer =>
        wallConfig.specificLayers!.includes(layer.id)
      )
    }

    return sceneConfig.layers
  }, [sceneConfig.layers, wallConfig])

  if (!wallConfig) {
    return (
      <div className="min-h-screen bg-red-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Wall Not Found</h1>
          <p>Wall {wallNumber} is not configured for this scene.</p>
          <p className="text-sm mt-4">
            Available walls: {sceneConfig.walls.map(w => w.id).join(', ')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen">
      {/* Three.js Scene */}
      <Canvas
        className="w-full h-full"
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
      >
        {/* Camera Setup */}
        <PerspectiveCamera
          makeDefault
          position={[
            wallConfig.camera.position.x,
            wallConfig.camera.position.y,
            wallConfig.camera.position.z,
          ]}
          fov={wallConfig.camera.fov}
          near={wallConfig.camera.near}
          far={wallConfig.camera.far}
        />

        {/* Scene Environment */}
        <SceneEnvironment sceneConfig={sceneConfig} />

        {/* Render Layers */}
        {wallLayers.map(layer => (
          <LayerRenderer
            key={layer.id}
            layer={layer}
            modifiers={parsedModifiers}
            currentTime={currentTime}
            wallDirection={wallConfig.direction}
          />
        ))}

        {/* Timeline Controller */}
        <TimelineController
          sceneConfig={sceneConfig}
          currentTime={currentTime}
          isPlaying={isPlaying}
          onTimeUpdate={setCurrentTime}
        />
      </Canvas>

      {/* Audio Manager */}
      <AudioManager
        programConfig={programConfig}
        sceneConfig={sceneConfig}
        modifiers={parsedModifiers}
        isPlaying={isPlaying}
      />

      {/* Scene Info Overlay */}
      <div className="absolute top-4 left-4 text-white/80 text-sm">
        <div className="bg-black/50 p-2 rounded">
          <div>{sceneConfig.name}</div>
          <div>
            Wall {wallNumber} ({wallConfig.direction})
          </div>
          {sceneConfig.duration && (
            <div>
              {Math.floor(currentTime)}s / {sceneConfig.duration}s
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Scene Environment Component
function SceneEnvironment({ sceneConfig }: { sceneConfig: SceneConfig }) {
  const { environment } = sceneConfig

  return (
    <>
      {/* Background Color */}
      <color
        attach="background"
        args={[
          environment.backgroundColor.r,
          environment.backgroundColor.g,
          environment.backgroundColor.b,
        ]}
      />

      {/* Fog */}
      {environment.fog && (
        <fog
          attach="fog"
          args={[
            `rgb(${Math.floor(environment.fog.color.r * 255)}, ${Math.floor(environment.fog.color.g * 255)}, ${Math.floor(environment.fog.color.b * 255)})`,
            environment.fog.near,
            environment.fog.far,
          ]}
        />
      )}

      {/* Skybox */}
      {environment.skybox && (
        <Environment files={environment.skybox.src} background />
      )}

      {/* Default Environment if no skybox */}
      {!environment.skybox && (
        <Environment preset="forest" background={false} />
      )}
    </>
  )
}
