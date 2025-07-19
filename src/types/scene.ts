export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface Color {
  r: number
  g: number
  b: number
}

export interface AudioConfig {
  id: string
  src: string
  volume: number
  loop: boolean
  spatial: boolean
  position?: Vector3
  fadeIn?: number
  fadeOut?: number
}

export interface LightConfig {
  id: string
  type: 'ambient' | 'directional' | 'point' | 'spot'
  color: Color
  intensity: number
  position?: Vector3
  target?: Vector3
  distance?: number
  angle?: number
  penumbra?: number
  castShadow?: boolean
}

export interface ParticleConfig {
  id: string
  type: 'fog' | 'rain' | 'snow' | 'leaves' | 'fireflies'
  count: number
  position: Vector3
  area: Vector3
  speed: number
  color: Color
  opacity: number
  size: number
}

export interface ModelConfig {
  id: string
  src: string
  position: Vector3
  rotation: Vector3
  scale: Vector3
  animations?: string[]
  castShadow?: boolean
  receiveShadow?: boolean
}

export interface CameraConfig {
  position: Vector3
  target: Vector3
  fov: number
  near: number
  far: number
}

export interface LayerConfig {
  id: string
  name: string
  visible: boolean
  opacity: number
  renderOrder: number
  models?: ModelConfig[]
  lights?: LightConfig[]
  particles?: ParticleConfig[]
  audio?: AudioConfig[]
}

export interface ModifierDefinition {
  id: string
  name: string
  description: string
  type: 'boolean' | 'number' | 'string' | 'select'
  default: string | number | boolean
  min?: number
  max?: number
  step?: number
  options?: string[]
  affects: string[] // Layer IDs this modifier affects
}

export interface WallConfig {
  id: number
  name: string
  direction: 'north' | 'south' | 'east' | 'west'
  camera: CameraConfig
  specificLayers?: string[] // If wall shows only specific layers
}

export interface SceneConfig {
  id: string
  name: string
  description: string
  duration?: number // Scene duration in seconds
  environment: {
    backgroundColor: Color
    fog?: {
      color: Color
      near: number
      far: number
      density?: number
    }
    skybox?: {
      src: string
      rotation?: Vector3
    }
  }
  walls: WallConfig[]
  layers: LayerConfig[]
  modifiers: ModifierDefinition[]
  timeline?: {
    events: Array<{
      time: number
      action: 'show' | 'hide' | 'animate' | 'audio'
      target: string
      parameters?: Record<string, string | number | boolean>
    }>
  }
}

export interface ProgramConfig {
  id: string
  name: string
  description: string
  author: string
  version: string
  scenes: Array<{
    id: string
    name: string
    thumbnail?: string
    duration?: number
  }>
  globalAudio?: AudioConfig[]
  preloadAssets?: string[]
}

export interface ModifierState {
  [modifierId: string]: string | number | boolean
}

export interface SceneState {
  currentTime: number
  isPlaying: boolean
  layers: Record<string, LayerConfig>
  modifiers: ModifierState
}
