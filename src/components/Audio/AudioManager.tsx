import { useEffect, useRef, useState, useCallback } from 'react'
import { ProgramConfig, SceneConfig, ModifierState } from '@/types/scene'

interface AudioManagerProps {
  programConfig: ProgramConfig
  sceneConfig: SceneConfig
  modifiers: ModifierState
  isPlaying: boolean
}

interface AudioInstance {
  id: string
  audio: HTMLAudioElement
  isLoaded: boolean
  isPlaying: boolean
}

export default function AudioManager({
  programConfig,
  sceneConfig,
  modifiers,
  isPlaying,
}: AudioManagerProps) {
  const audioInstancesRef = useRef<Map<string, AudioInstance>>(new Map())
  const [isInitialized, setIsInitialized] = useState(false)

  // Helper function to get audio config
  const getAudioConfig = useCallback(
    (audioId: string) => {
      // Check global audio
      if (programConfig.globalAudio) {
        const globalAudio = programConfig.globalAudio.find(
          a => a.id === audioId
        )
        if (globalAudio) return globalAudio
      }

      // Check scene audio
      for (const layer of sceneConfig.layers) {
        if (layer.audio) {
          const sceneAudio = layer.audio.find(a => a.id === audioId)
          if (sceneAudio) return sceneAudio
        }
      }

      return null
    },
    [programConfig.globalAudio, sceneConfig.layers]
  )

  // Helper function to determine if audio should play
  const getShouldPlay = useCallback(
    (audioConfig: unknown, modifiers: ModifierState) => {
      const config = audioConfig as { id: string }
      // Check if explicitly disabled
      if (modifiers[`${config.id}_enabled`] === false) {
        return false
      }

      // Check if explicitly enabled
      if (modifiers[`${config.id}_enabled`] === true) {
        return true
      }

      // Default behavior - play ambient sounds by default
      return config.id.includes('ambient') || config.id.includes('background')
    },
    []
  )

  // Initialize audio instances
  useEffect(() => {
    const instances = new Map<string, AudioInstance>()

    // Load global audio
    if (programConfig.globalAudio) {
      programConfig.globalAudio.forEach(audioConfig => {
        const audio = new Audio(audioConfig.src)
        audio.volume = audioConfig.volume
        audio.loop = audioConfig.loop

        instances.set(audioConfig.id, {
          id: audioConfig.id,
          audio,
          isLoaded: false,
          isPlaying: false,
        })

        audio.addEventListener('loadeddata', () => {
          const instance = instances.get(audioConfig.id)
          if (instance) {
            instance.isLoaded = true
          }
        })
      })
    }

    // Load scene audio
    sceneConfig.layers.forEach(layer => {
      if (layer.audio) {
        layer.audio.forEach(audioConfig => {
          const audio = new Audio(audioConfig.src)
          audio.volume = audioConfig.volume
          audio.loop = audioConfig.loop

          instances.set(audioConfig.id, {
            id: audioConfig.id,
            audio,
            isLoaded: false,
            isPlaying: false,
          })

          audio.addEventListener('loadeddata', () => {
            const instance = instances.get(audioConfig.id)
            if (instance) {
              instance.isLoaded = true
            }
          })
        })
      }
    })

    audioInstancesRef.current = instances
    setIsInitialized(true)

    // Cleanup
    return () => {
      instances.forEach(instance => {
        instance.audio.pause()
        instance.audio.src = ''
      })
    }
  }, [programConfig, sceneConfig])

  // Handle play/pause state
  useEffect(() => {
    if (!isInitialized) return

    audioInstancesRef.current.forEach(instance => {
      const audioConfig = getAudioConfig(instance.id)
      if (!audioConfig || !instance.isLoaded) return

      // Check if audio should be playing based on modifiers
      const shouldPlay = getShouldPlay(audioConfig, modifiers)

      if (isPlaying && shouldPlay && !instance.isPlaying) {
        // Start playing
        instance.audio.currentTime = 0
        instance.audio.play().catch(console.error)
        instance.isPlaying = true
      } else if ((!isPlaying || !shouldPlay) && instance.isPlaying) {
        // Stop playing
        instance.audio.pause()
        instance.isPlaying = false
      }
    })
  }, [isPlaying, modifiers, isInitialized, getAudioConfig, getShouldPlay])

  // Update audio properties based on modifiers
  useEffect(() => {
    if (!isInitialized) return

    audioInstancesRef.current.forEach(instance => {
      const audioConfig = getAudioConfig(instance.id)
      if (!audioConfig) return

      // Update volume
      let volume = audioConfig.volume
      if (modifiers[`${audioConfig.id}_volume`] !== undefined) {
        volume = Number(modifiers[`${audioConfig.id}_volume`]) || volume
      }
      instance.audio.volume = Math.max(0, Math.min(1, volume))

      // Update playback rate (speed)
      if (modifiers[`${audioConfig.id}_speed`] !== undefined) {
        const speed = Number(modifiers[`${audioConfig.id}_speed`]) || 1
        instance.audio.playbackRate = Math.max(0.25, Math.min(4, speed))
      }
    })
  }, [modifiers, isInitialized, getAudioConfig])

  // This component doesn't render anything
  return null
}
