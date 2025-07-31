'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import SceneRenderer from '@/components/Scene/SceneRenderer'
import DevPanel from '@/components/ui/DevPanel'
import { ProgramConfig, SceneConfig } from '@/types/scene'

interface WallPageProps {
  params: Promise<{
    name: string
    scene_name: string
    wall_number: string
  }>
}

export default function WallPage({ params }: WallPageProps) {
  const [resolvedParams, setResolvedParams] = useState<{
    name: string
    scene_name: string
    wall_number: string
  } | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  const [programConfig, setProgramConfig] = useState<ProgramConfig | null>(null)
  const [sceneConfig, setSceneConfig] = useState<SceneConfig | null>(null)
  const [modifiers, setModifiers] = useState<Record<string, string>>({})
  const [isDevMode, setIsDevMode] = useState(false)

  // Resolve params
  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  // Parse URL modifiers
  useEffect(() => {
    const modifierString = searchParams ? searchParams.get('modifiers') : null
    if (modifierString) {
      const parsedModifiers: Record<string, string> = {}

      modifierString.split(',').forEach(modifier => {
        const [key, value] = modifier.split(':')
        if (key && value) {
          parsedModifiers[key] = value
        }
      })

      setModifiers(parsedModifiers)
    }
  }, [searchParams])

  // Load program configuration
  useEffect(() => {
    if (resolvedParams?.name && resolvedParams?.scene_name) {
      loadProgramConfig(resolvedParams.name, resolvedParams.scene_name)
    }
  }, [resolvedParams])

  const loadProgramConfig = async (programName: string, sceneName: string) => {
    try {
      console.log('🔄 Loading program config for:', programName, sceneName)

      // Load program config
      const programResponse = await fetch(
        `/data/programs/${programName}/config.json`
      )

      if (!programResponse.ok) {
        throw new Error(`Program config not found: ${programResponse.status}`)
      }

      const program = await programResponse.json()
      console.log('✅ Program config loaded:', program)
      setProgramConfig(program)

      // Load scene config
      const sceneResponse = await fetch(
        `/data/programs/${programName}/scenes/${sceneName}.json`
      )

      if (!sceneResponse.ok) {
        throw new Error(`Scene config not found: ${sceneResponse.status}`)
      }

      const scene = await sceneResponse.json()
      console.log('✅ Scene config loaded:', scene)
      setSceneConfig(scene)
    } catch (error) {
      console.error('❌ Failed to load configuration:', error)
    }
  }

  // Toggle dev mode with keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault()
        setIsDevMode(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const updateModifiers = (newModifiers: Record<string, string>) => {
    if (!resolvedParams) return

    const modifierString = Object.entries(newModifiers)
      .map(([key, value]) => `${key}:${value}`)
      .join(',')

    const currentPath = `/service/programs/${resolvedParams.name}/${resolvedParams.scene_name}/${resolvedParams.wall_number}`
    const newUrl = modifierString
      ? `${currentPath}?modifiers=${modifierString}`
      : currentPath

    router.push(newUrl)
  }

  if (!resolvedParams || !programConfig || !sceneConfig) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>
            Loading {resolvedParams?.name} - {resolvedParams?.scene_name} - Wall{' '}
            {resolvedParams?.wall_number}...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative">
      <SceneRenderer
        programConfig={programConfig}
        sceneConfig={sceneConfig}
        wallNumber={parseInt(resolvedParams.wall_number)}
        modifiers={modifiers}
      />

      {isDevMode && (
        <DevPanel
          sceneConfig={sceneConfig}
          modifiers={modifiers}
          onModifiersChange={updateModifiers}
          onClose={() => setIsDevMode(false)}
        />
      )}

      {/* Dev mode toggle hint */}
      <div className="absolute bottom-4 right-4 text-white/50 text-xs">
        Press Ctrl+D for dev panel
      </div>
    </div>
  )
}
