import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { MotionValue } from 'framer-motion'
import { PHOTO_SLOTS } from './PhotoGalleryWall'
import type { CameraPose, FocusTargetId, TouchLookState } from './types'

interface CameraRigProps {
    progress: MotionValue<number>
    openRef: { current: number }
    focusedTarget: FocusTargetId
    focusedPhotoIndex: number | null
    isMobile: boolean
    prefersReducedMotion: boolean
    touchLookRef: { current: TouchLookState }
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const range = (v: number, a: number, b: number) => clamp01((v - a) / (b - a))
const smooth = (t: number) => t * t * (3 - 2 * t)

const DESKTOP_PRESETS: Record<Exclude<FocusTargetId, 'overview'>, CameraPose> = {
    informacoes: {
        position: [-3.35, 2.75, -6.2],
        target: [-3.55, 2.85, -9.9],
        fov: 38,
    },
    fotos: {
        position: [-2.1, 2.85, -2.15],
        target: [-5.9, 2.95, -2.15],
        fov: 42,
    },
    musicas: {
        position: [2.35, 2.02, -5.15],
        target: [5.55, 1.88, -6.5],
        fov: 46,
    },
    criancas: {
        position: [-1.35, 1.58, -0.65],
        target: [-3.3, 0.48, -2.5],
        fov: 42,
    },
    inscricao: {
        position: [1.15, 1.48, -1.65],
        target: [2.35, 1.08, -3.7],
        fov: 38,
    },
}

const MOBILE_PRESETS: Record<Exclude<FocusTargetId, 'overview'>, CameraPose> = {
    informacoes: {
        position: [-3.25, 2.75, -5.6],
        target: [-3.55, 2.85, -9.9],
        fov: 46,
    },
    fotos: {
        position: [-1.7, 2.85, -2.15],
        target: [-5.9, 2.95, -2.15],
        fov: 48,
    },
    musicas: {
        position: [2.8, 1.82, -5.4],
        target: [5.5, 1.55, -6.5],
        fov: 48,
    },
    criancas: {
        position: [-0.9, 1.65, -0.35],
        target: [-3.3, 0.48, -2.5],
        fov: 48,
    },
    inscricao: {
        position: [0.95, 1.5, -1.35],
        target: [2.35, 1.08, -3.7],
        fov: 46,
    },
}

export function CameraRig({
    progress,
    openRef,
    focusedTarget,
    focusedPhotoIndex,
    isMobile,
    prefersReducedMotion,
    touchLookRef,
}: CameraRigProps) {
    const { camera, pointer } = useThree()
    const pos = useMemo(() => new THREE.Vector3(), [])
    const look = useMemo(() => new THREE.Vector3(), [])
    const curLook = useRef(new THREE.Vector3(0, 1.85, 0))

    const P0Pos = useMemo(() => new THREE.Vector3(0, 1.85, 8.9), [])
    const P0Look = useMemo(() => new THREE.Vector3(0, 1.85, 0), [])
    const P1Pos = useMemo(() => new THREE.Vector3(0, 1.78, 0.7), [])
    const P1Look = useMemo(() => new THREE.Vector3(0, 1.85, -6.5), [])

    const overviewPos = useMemo(
        () => new THREE.Vector3(isMobile ? 0.65 : 0.95, isMobile ? 2.3 : 2.35, isMobile ? -0.85 : -0.45),
        [isMobile]
    )
    const overviewLook = useMemo(
        () => new THREE.Vector3(isMobile ? 0.35 : 0.2, isMobile ? 2.15 : 2.05, isMobile ? -7.4 : -7.0),
        [isMobile]
    )

    useFrame((_, dt) => {
        const p = prefersReducedMotion ? 1 : progress.get()
        openRef.current = prefersReducedMotion ? 1 : range(p, 0, 0.42)
        const d = prefersReducedMotion ? 1 : smooth(range(p, 0.16, 0.92))

        let targetFov = 36

        if (d > 0.85 && focusedTarget !== 'overview') {
            if (focusedTarget === 'fotos' && focusedPhotoIndex !== null && PHOTO_SLOTS[focusedPhotoIndex]) {
                const slot = PHOTO_SLOTS[focusedPhotoIndex]
                const mult = isMobile ? 1.2 : 1.0
                pos.set(
                    slot.position[0] + slot.camOffset[0] * mult,
                    slot.position[1] + slot.camOffset[1],
                    slot.position[2] + slot.camOffset[2] * mult
                )
                look.set(slot.position[0], slot.position[1], slot.position[2])
                targetFov = isMobile ? 45 : 38
            } else {
                const preset = (isMobile ? MOBILE_PRESETS : DESKTOP_PRESETS)[focusedTarget]
                pos.set(...preset.position)
                look.set(...preset.target)
                targetFov = preset.fov
            }
        } else {
            if (d < 0.56) {
                const t = smooth(d / 0.56)
                pos.lerpVectors(P0Pos, P1Pos, t)
                look.lerpVectors(P0Look, P1Look, t)
                targetFov = 36 + 4 * t
            } else {
                const t = smooth((d - 0.56) / 0.44)
                pos.lerpVectors(P1Pos, overviewPos, t)
                look.lerpVectors(P1Look, overviewLook, t)
                targetFov = 40 + (isMobile ? 20 : 12) * t
            }

            // Parallax suave no desktop ou controles por toque no mobile
            if (!prefersReducedMotion) {
                if (isMobile && d > 0.72) {
                    const tl = touchLookRef.current
                    look.x += tl.yaw * 2.2
                    look.y += tl.pitch * 1.1
                    targetFov = Math.min(62, Math.max(38, targetFov + tl.zoomOffset))
                } else if (!isMobile) {
                    pos.x += pointer.x * 0.18
                    pos.y += pointer.y * 0.12
                }
            }
        }

        const cam = camera as THREE.PerspectiveCamera
        const dampRate = prefersReducedMotion ? 60 : 5.5
        cam.fov = THREE.MathUtils.damp(cam.fov, targetFov, dampRate, dt)
        if (Math.abs(cam.fov - targetFov) > 0.01) {
            cam.updateProjectionMatrix()
        }

        const lerpAlpha = prefersReducedMotion ? 1 : 1 - Math.exp(-5.5 * dt)
        camera.position.lerp(pos, lerpAlpha)
        curLook.current.lerp(look, lerpAlpha)
        camera.lookAt(curLook.current)
    })

    return null
}
