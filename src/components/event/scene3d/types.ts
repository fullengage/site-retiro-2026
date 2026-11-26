import type { MotionValue } from 'framer-motion'

export type QualityTier = 'high' | 'medium' | 'low'

export type FocusTargetId =
    | 'overview'
    | 'informacoes'
    | 'fotos'
    | 'musicas'
    | 'criancas'
    | 'inscricao'

export interface Scene3DLabel {
    id: string
    label: string
}

export interface Scene3DPhoto {
    url: string
    label?: string | null
}

export interface CameraPose {
    position: [number, number, number]
    target: [number, number, number]
    fov: number
}

export interface TouchLookState {
    yaw: number
    pitch: number
    zoomOffset: number
}

export interface Experience3DProps {
    progress: MotionValue<number>
    labels: Scene3DLabel[]
    photos: Scene3DPhoto[]
    info: string[]
    isPlaying: boolean
    focusedTarget: FocusTargetId
    focusedPhotoIndex: number | null
    quality: QualityTier
    isMobile: boolean
    prefersReducedMotion: boolean
    touchLookRef: { current: TouchLookState }
    onFocusTarget: (target: FocusTargetId, openPanel?: boolean) => void
    onSelectPhoto: (index: number) => void
    onTogglePlay: () => void
    onOpenPanel: (id: string) => void
    onReady: () => void
    onContextLost: () => void
    onDegradeQuality: () => void
}

export const PALETTE = {
    espresso: '#2B1B14',
    walnut: '#5A3B2E',
    cinnamon: '#8B6A55',
    sand: '#C9B19C',
    cream: '#F3E7D6',
    warmWhite: '#FAF3E8',
    brass: '#C89B54',
    goldLight: '#FFE1AE',
    sage: '#6E7F6A',
    terracotta: '#B56345',
} as const
