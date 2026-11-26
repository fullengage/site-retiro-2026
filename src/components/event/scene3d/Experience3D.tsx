import { Suspense, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { CameraRig } from './CameraRig'
import { CommunionFurniture } from './CommunionFurniture'
import { ExteriorFacade } from './ExteriorFacade'
import { LightingAndAtmosphere } from './LightingAndAtmosphere'
import { PhotoGalleryWall } from './PhotoGalleryWall'
import { RoomArchitecture } from './RoomArchitecture'
import { SanctuaryWall } from './SanctuaryWall'
import { TurntableCorner } from './TurntableCorner'
import { useFpsMonitor } from './useAdaptiveQuality'
import type { Experience3DProps, QualityTier } from './types'

function FpsGuard({
    quality,
    onDegradeQuality,
}: {
    quality: QualityTier
    onDegradeQuality: () => void
}) {
    useFpsMonitor(quality, onDegradeQuality, true)
    return null
}

function Experience3D({
    progress,
    labels,
    photos,
    info,
    isPlaying,
    focusedTarget,
    focusedPhotoIndex,
    quality,
    isMobile,
    prefersReducedMotion,
    touchLookRef,
    onFocusTarget,
    onSelectPhoto,
    onTogglePlay,
    onReady,
    onContextLost,
    onDegradeQuality,
}: Experience3DProps) {
    const openRef = useRef(0)
    const readySentRef = useRef(false)

    const has = (id: string) => labels.some(l => l.id === id)

    const dpr: [number, number] =
        quality === 'high' ? [1, 1.75] : quality === 'medium' ? [1, 1.35] : [0.85, 1]

    useEffect(() => {
        if (!readySentRef.current) {
            readySentRef.current = true
            onReady()
        }
    }, [onReady])

    return (
        <Canvas
            className="!absolute inset-0"
            aria-hidden="true"
            dpr={dpr}
            shadows={quality !== 'low'}
            camera={{ fov: 36, position: [0, 1.85, 8.9], near: 0.1, far: 80 }}
            gl={{
                antialias: quality !== 'low',
                powerPreference: 'high-performance',
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.06,
            }}
            onCreated={({ gl }) => {
                const canvas = gl.domElement
                const handleLost = (e: Event) => {
                    e.preventDefault()
                    onContextLost()
                }
                canvas.addEventListener('webglcontextlost', handleLost, false)
                if (!readySentRef.current) {
                    readySentRef.current = true
                    onReady()
                }
            }}
        >
            <FpsGuard quality={quality} onDegradeQuality={onDegradeQuality} />

            <LightingAndAtmosphere
                quality={quality}
                prefersReducedMotion={prefersReducedMotion}
            />

            <CameraRig
                progress={progress}
                openRef={openRef}
                focusedTarget={focusedTarget}
                focusedPhotoIndex={focusedPhotoIndex}
                isMobile={isMobile}
                prefersReducedMotion={prefersReducedMotion}
                touchLookRef={touchLookRef}
            />

            <ExteriorFacade openRef={openRef} quality={quality} />

            <RoomArchitecture
                quality={quality}
                prefersReducedMotion={prefersReducedMotion}
            />

            <Suspense fallback={null}>
                <SanctuaryWall
                    info={info}
                    hasSchedule={has('informacoes')}
                    focusedTarget={focusedTarget}
                    onFocusTarget={onFocusTarget}
                />

                <PhotoGalleryWall
                    photos={photos}
                    focusedTarget={focusedTarget}
                    focusedPhotoIndex={focusedPhotoIndex}
                    onSelectPhoto={onSelectPhoto}
                />

                {has('musicas') && (
                    <TurntableCorner
                        isPlaying={isPlaying}
                        focusedTarget={focusedTarget}
                        quality={quality}
                        prefersReducedMotion={prefersReducedMotion}
                        onFocusTarget={onFocusTarget}
                        onTogglePlay={onTogglePlay}
                    />
                )}

                <CommunionFurniture
                    info={info}
                    hasKidsArea={has('criancas')}
                    hasRegistration={has('inscricao')}
                    focusedTarget={focusedTarget}
                    onFocusTarget={onFocusTarget}
                />
            </Suspense>
        </Canvas>
    )
}

export default Experience3D
