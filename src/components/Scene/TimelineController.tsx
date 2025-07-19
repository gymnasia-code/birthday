import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { SceneConfig } from '@/types/scene'

interface TimelineControllerProps {
  sceneConfig: SceneConfig
  currentTime: number
  isPlaying: boolean
  onTimeUpdate: (time: number) => void
}

export default function TimelineController({
  sceneConfig,
  currentTime,
  isPlaying,
  onTimeUpdate,
}: TimelineControllerProps) {
  const startTimeRef = useRef<number>(Date.now())
  const pausedTimeRef = useRef<number>(0)

  // Reset timeline when scene changes
  useEffect(() => {
    startTimeRef.current = Date.now()
    pausedTimeRef.current = 0
    onTimeUpdate(0)
  }, [sceneConfig.id, onTimeUpdate])

  // Update time
  useFrame((state, delta) => {
    if (isPlaying) {
      const newTime = currentTime + delta

      // Loop if scene has duration
      if (sceneConfig.duration && newTime >= sceneConfig.duration) {
        startTimeRef.current = Date.now()
        onTimeUpdate(0)
      } else {
        onTimeUpdate(newTime)
      }
    }
  })

  // Execute timeline events
  useEffect(() => {
    if (!sceneConfig.timeline?.events) return

    sceneConfig.timeline.events.forEach(event => {
      const timeDiff = Math.abs(currentTime - event.time)

      // Execute event if we're close to the event time (within 0.1 seconds)
      if (timeDiff < 0.1) {
        switch (event.action) {
          case 'show':
          case 'hide':
          case 'animate':
            // These would be handled by the individual renderers
            // We could dispatch custom events or use a global state manager
            console.log(
              `Timeline event: ${event.action} ${event.target} at ${event.time}s`
            )
            break
          case 'audio':
            // Audio events would be handled by AudioManager
            console.log(
              `Timeline audio event: ${event.target} at ${event.time}s`
            )
            break
        }
      }
    })
  }, [currentTime, sceneConfig.timeline])

  // This component doesn't render anything visual
  return null
}
