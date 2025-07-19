import React, { useState } from 'react'
import { SceneConfig } from '@/types/scene'

interface DevPanelProps {
  sceneConfig: SceneConfig
  modifiers: Record<string, string>
  onModifiersChange: (modifiers: Record<string, string>) => void
  onClose: () => void
}

export default function DevPanel({
  sceneConfig,
  modifiers,
  onModifiersChange,
  onClose,
}: DevPanelProps) {
  const [activeTab, setActiveTab] = useState<'modifiers' | 'layers' | 'info'>(
    'modifiers'
  )

  const updateModifier = (
    modifierId: string,
    value: string | number | boolean
  ) => {
    const newModifiers = { ...modifiers, [modifierId]: String(value) }
    onModifiersChange(newModifiers)
  }

  const resetModifiers = () => {
    const resetModifiers: Record<string, string> = {}
    sceneConfig.modifiers.forEach(mod => {
      resetModifiers[mod.id] = String(mod.default)
    })
    onModifiersChange(resetModifiers)
  }

  return (
    <div className="fixed top-0 right-0 w-96 h-full bg-black/90 text-white overflow-y-auto z-50 border-l border-gray-600">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-600">
        <h2 className="text-lg font-bold">Dev Panel</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-600">
        {['modifiers', 'layers', 'info'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as 'modifiers' | 'layers' | 'info')}
            className={`flex-1 px-4 py-2 text-sm capitalize ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-4">
        {/* Modifiers Tab */}
        {activeTab === 'modifiers' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-semibold">Scene Modifiers</h3>
              <button
                onClick={resetModifiers}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
              >
                Reset All
              </button>
            </div>

            {sceneConfig.modifiers.map(modifier => (
              <div key={modifier.id} className="space-y-2">
                <label className="block text-sm font-medium">
                  {modifier.name}
                  {modifier.description && (
                    <span className="text-gray-400 text-xs block">
                      {modifier.description}
                    </span>
                  )}
                </label>

                {modifier.type === 'boolean' && (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={modifiers[modifier.id] === 'true'}
                      onChange={e =>
                        updateModifier(modifier.id, e.target.checked)
                      }
                      className="rounded"
                    />
                    <span className="text-sm">Enabled</span>
                  </label>
                )}

                {modifier.type === 'number' && (
                  <input
                    type="number"
                    min={modifier.min}
                    max={modifier.max}
                    step={modifier.step || 0.1}
                    value={modifiers[modifier.id] || String(modifier.default)}
                    onChange={e => updateModifier(modifier.id, e.target.value)}
                    className="w-full px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white"
                  />
                )}

                {modifier.type === 'string' && (
                  <input
                    type="text"
                    value={modifiers[modifier.id] || String(modifier.default)}
                    onChange={e => updateModifier(modifier.id, e.target.value)}
                    className="w-full px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white"
                  />
                )}

                {modifier.type === 'select' && modifier.options && (
                  <select
                    value={modifiers[modifier.id] || String(modifier.default)}
                    onChange={e => updateModifier(modifier.id, e.target.value)}
                    className="w-full px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white"
                  >
                    {modifier.options.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                <div className="text-xs text-gray-500">
                  Current: {modifiers[modifier.id] || String(modifier.default)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Layers Tab */}
        {activeTab === 'layers' && (
          <div className="space-y-4">
            <h3 className="text-md font-semibold">Scene Layers</h3>

            {sceneConfig.layers.map(layer => (
              <div key={layer.id} className="bg-gray-800 p-3 rounded">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{layer.name}</h4>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      layer.visible ? 'bg-green-600' : 'bg-red-600'
                    }`}
                  >
                    {layer.visible ? 'Visible' : 'Hidden'}
                  </span>
                </div>

                <div className="text-sm text-gray-300 space-y-1">
                  <div>Opacity: {(layer.opacity * 100).toFixed(0)}%</div>
                  <div>Render Order: {layer.renderOrder}</div>
                  {layer.models && <div>Models: {layer.models.length}</div>}
                  {layer.lights && <div>Lights: {layer.lights.length}</div>}
                  {layer.particles && (
                    <div>Particle Systems: {layer.particles.length}</div>
                  )}
                  {layer.audio && (
                    <div>Audio Sources: {layer.audio.length}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <h3 className="text-md font-semibold">Scene Information</h3>

            <div className="bg-gray-800 p-3 rounded space-y-2">
              <div>
                <strong>Name:</strong> {sceneConfig.name}
              </div>
              <div>
                <strong>ID:</strong> {sceneConfig.id}
              </div>
              <div>
                <strong>Description:</strong> {sceneConfig.description}
              </div>
              {sceneConfig.duration && (
                <div>
                  <strong>Duration:</strong> {sceneConfig.duration}s
                </div>
              )}
            </div>

            <div className="bg-gray-800 p-3 rounded space-y-2">
              <h4 className="font-medium">Environment</h4>
              <div>
                <strong>Background:</strong> rgb(
                {Math.floor(sceneConfig.environment.backgroundColor.r * 255)},{' '}
                {Math.floor(sceneConfig.environment.backgroundColor.g * 255)},{' '}
                {Math.floor(sceneConfig.environment.backgroundColor.b * 255)})
              </div>
              {sceneConfig.environment.fog && (
                <div>
                  <strong>Fog:</strong> Enabled
                </div>
              )}
              {sceneConfig.environment.skybox && (
                <div>
                  <strong>Skybox:</strong> {sceneConfig.environment.skybox.src}
                </div>
              )}
            </div>

            <div className="bg-gray-800 p-3 rounded space-y-2">
              <h4 className="font-medium">Walls</h4>
              {sceneConfig.walls.map(wall => (
                <div key={wall.id} className="text-sm">
                  <strong>
                    Wall {wall.id} ({wall.direction}):
                  </strong>{' '}
                  {wall.name}
                </div>
              ))}
            </div>

            {sceneConfig.timeline && (
              <div className="bg-gray-800 p-3 rounded space-y-2">
                <h4 className="font-medium">Timeline</h4>
                <div>
                  <strong>Events:</strong> {sceneConfig.timeline.events.length}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
