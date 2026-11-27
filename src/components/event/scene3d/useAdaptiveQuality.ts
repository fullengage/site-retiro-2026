import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { QualityTier } from './types'

export interface AdaptiveCapability {
    checked: boolean
    webglSupported: boolean
    initialQuality: QualityTier
    isMobile: boolean
    prefersReducedMotion: boolean
}

function detectWebGLCapability(isMobile: boolean): { supported: boolean; quality: QualityTier } {
    if (typeof window === 'undefined') {
        return { supported: false, quality: 'low' }
    }

    let canvas: HTMLCanvasElement | null = null
    try {
        canvas = document.createElement('canvas')
        const gl = (canvas.getContext('webgl2', {
            alpha: false,
            antialias: false,
            failIfMajorPerformanceCaveat: false,
        }) ||
            canvas.getContext('webgl', {
                alpha: false,
                antialias: false,
                failIfMajorPerformanceCaveat: false,
            }) ||
            canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null

        if (!gl) {
            return { supported: false, quality: 'low' }
        }

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        const renderer = debugInfo
            ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '')
            : ''
        const isSoftware = /swiftshader|llvmpipe|software|basic render/i.test(renderer)

        const cores = navigator.hardwareConcurrency || 4
        const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4

        if (isSoftware || cores <= 2 || memory <= 2) {
            return { supported: true, quality: 'low' }
        }
        if (isMobile || cores <= 4 || memory <= 4) {
            return { supported: true, quality: 'medium' }
        }
        return { supported: true, quality: 'high' }
    } catch {
        return { supported: false, quality: 'low' }
    } finally {
        canvas = null
    }
}

/**
 * Detecta suporte WebGL, heuristica de GPU/dispositivo e preferencias de acessibilidade.
 */
export function useAdaptiveQuality(): AdaptiveCapability {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() =>
        typeof window !== 'undefined'
            ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
            : false
    )
    const [isMobile, setIsMobile] = useState<boolean>(() =>
        typeof window !== 'undefined'
            ? window.matchMedia('(max-width: 767px), (pointer: coarse)').matches
            : false
    )
    const [checked, setChecked] = useState(false)
    const [webglSupported, setWebglSupported] = useState(true)
    const [initialQuality, setInitialQuality] = useState<QualityTier>(() =>
        isMobile ? 'medium' : 'high'
    )

    useEffect(() => {
        if (typeof window === 'undefined') return
        const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)')
        const mobileMq = window.matchMedia('(max-width: 767px), (pointer: coarse)')

        const onMotion = () => setPrefersReducedMotion(motionMq.matches)
        const onMobile = () => setIsMobile(mobileMq.matches)

        motionMq.addEventListener('change', onMotion)
        mobileMq.addEventListener('change', onMobile)
        return () => {
            motionMq.removeEventListener('change', onMotion)
            mobileMq.removeEventListener('change', onMobile)
        }
    }, [])

    useEffect(() => {
        let cancelled = false
        const raf = window.requestAnimationFrame(() => {
            if (cancelled) return
            const res = detectWebGLCapability(isMobile)
            setWebglSupported(res.supported)
            setInitialQuality(res.quality)
            setChecked(true)
        })
        return () => {
            cancelled = true
            window.cancelAnimationFrame(raf)
        }
    }, [isMobile])

    return {
        checked,
        webglSupported,
        initialQuality,
        isMobile,
        prefersReducedMotion,
    }
}

/**
 * Monitora FPS dentro do Canvas R3F e rebaixa qualidade automaticamente se < 24fps por > 2.5s.
 */
export function useFpsMonitor(
    quality: QualityTier,
    onDegrade: () => void,
    enabled: boolean
) {
    const framesRef = useRef(0)
    const elapsedRef = useRef(0)
    const lowStreakRef = useRef(0)

    useFrame((_, dt) => {
        if (!enabled || quality === 'low') return
        // Ignora spikes isolados de troca de aba
        if (dt > 0.25) return

        framesRef.current += 1
        elapsedRef.current += dt

        if (elapsedRef.current >= 1.25) {
            const fps = framesRef.current / elapsedRef.current
            framesRef.current = 0
            elapsedRef.current = 0

            if (fps < 24) {
                lowStreakRef.current += 1
                if (lowStreakRef.current >= 2) {
                    lowStreakRef.current = 0
                    onDegrade()
                }
            } else {
                lowStreakRef.current = 0
            }
        }
    })
}
