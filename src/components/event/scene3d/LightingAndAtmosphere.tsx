import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import type { QualityTier } from './types'

interface LightingAndAtmosphereProps {
    quality: QualityTier
    prefersReducedMotion: boolean
}

const GOD_RAY_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const GOD_RAY_FRAG = /* glsl */ `
uniform float uTime;
uniform float uOpacity;
varying vec2 vUv;

void main() {
    // Suaviza bordas laterais do feixe
    float sideFade = smoothstep(0.0, 0.32, vUv.x) * smoothstep(1.0, 0.68, vUv.x);
    // Mais forte proximo a janela (vUv.y = 1) e desvanece ao tocar o piso (vUv.y = 0)
    float lengthFade = pow(vUv.y, 1.35) * smoothstep(0.0, 0.22, vUv.y);
    // Ondulacao suave atmosferica
    float shimmer = 0.88 + 0.12 * sin(uTime * 0.45 + vUv.x * 5.0);
    float alpha = sideFade * lengthFade * shimmer * uOpacity;
    vec3 sunCol = vec3(1.0, 0.90, 0.72);
    gl_FragColor = vec4(sunCol, alpha);
}
`

function SunShaft({
    position,
    rotation,
    size,
    opacity,
    prefersReducedMotion,
    phase = 0,
}: {
    position: [number, number, number]
    rotation: [number, number, number]
    size: [number, number]
    opacity: number
    prefersReducedMotion: boolean
    phase?: number
}) {
    const matRef = useRef<THREE.ShaderMaterial>(null)
    const uniforms = useMemo(
        () => ({
            uTime: { value: phase },
            uOpacity: { value: opacity },
        }),
        [opacity, phase]
    )

    useFrame(({ clock }) => {
        if (!matRef.current || prefersReducedMotion) return
        matRef.current.uniforms.uTime.value = clock.elapsedTime + phase
    })

    return (
        <mesh position={position} rotation={rotation} renderOrder={5}>
            <planeGeometry args={size} />
            <shaderMaterial
                ref={matRef}
                vertexShader={GOD_RAY_VERT}
                fragmentShader={GOD_RAY_FRAG}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
            />
        </mesh>
    )
}

export function LightingAndAtmosphere({
    quality,
    prefersReducedMotion,
}: LightingAndAtmosphereProps) {
    const shadowSize = quality === 'high' ? 2048 : 1024

    return (
        <>
            <color attach="background" args={['#EEDEC8']} />
            <fog attach="fog" args={['#EEDEC8', 17, 36]} />

            {/* IBL procedural quente para reflexos realistas em latao, vidro e vinil */}
            <Environment resolution={quality === 'high' ? 256 : 128} frames={1}>
                <Lightformer
                    form="rect"
                    intensity={2.6}
                    color="#FFE8C2"
                    scale={[6, 5, 1]}
                    position={[-8, 3.2, -5.5]}
                    rotation={[0, Math.PI / 2, 0]}
                />
                <Lightformer
                    form="rect"
                    intensity={1.5}
                    color="#FFDCA6"
                    scale={[9, 7, 1]}
                    position={[0, 7, -5]}
                    rotation={[Math.PI / 2, 0, 0]}
                />
                <Lightformer
                    form="circle"
                    intensity={1.2}
                    color="#EBC89D"
                    scale={6}
                    position={[6, 3, -6]}
                    rotation={[0, -Math.PI / 2, 0]}
                />
                <Lightformer
                    form="rect"
                    intensity={0.9}
                    color="#C9A886"
                    scale={[12, 10, 1]}
                    position={[0, -3, -5]}
                    rotation={[-Math.PI / 2, 0, 0]}
                />
            </Environment>

            <ambientLight intensity={0.32} color="#F7E5CE" />
            <hemisphereLight args={['#FFF2DE', '#6C4A38', 0.62]} />

            {/* Luz solar natural entrando pela janela esquerda */}
            <directionalLight
                position={[-11.5, 7.6, -3.2]}
                intensity={2.45}
                color="#FFE5BF"
                castShadow={quality !== 'low'}
                shadow-mapSize={[shadowSize, shadowSize]}
                shadow-bias={-0.0004}
                shadow-normalBias={0.03}
                shadow-radius={4}
                shadow-camera-left={-9}
                shadow-camera-right={9}
                shadow-camera-top={8}
                shadow-camera-bottom={-8}
                shadow-camera-near={1}
                shadow-camera-far={28}
            />

            {/* Luz de preenchimento frontal suave para destacar madeira das portas e vasos externos */}
            <directionalLight
                position={[3, 4.5, 9]}
                intensity={0.55}
                color="#FFF0D8"
            />

            {/* Luz do lustre/sanca central aquecendo a comunhao */}
            <pointLight
                position={[0, 4.9, -5.0]}
                intensity={14}
                distance={14}
                decay={1.8}
                color="#FFD9A3"
            />

            {/* Destaque no nicho da Cruz + Logo da Comunidade */}
            <pointLight
                position={[0, 3.8, -8.8]}
                intensity={12}
                distance={9}
                decay={1.8}
                color="#FFE0AE"
            />

            {/* Luz intima do abajur da vitrola */}
            <pointLight
                position={[4.6, 1.9, -7.8]}
                intensity={7.5}
                distance={6.5}
                decay={2}
                color="#FFBD6E"
            />

            {/* Raios de luz natural (god rays) atravessando a janela */}
            <group position={[0, 0, 0]}>
                <SunShaft
                    position={[-3.15, 2.55, -7.1]}
                    rotation={[0.06, 0.14, -0.78]}
                    size={[1.65, 7.6]}
                    opacity={quality === 'low' ? 0.14 : 0.22}
                    prefersReducedMotion={prefersReducedMotion}
                    phase={0}
                />
                <SunShaft
                    position={[-2.75, 2.45, -5.85]}
                    rotation={[0.03, 0.05, -0.8]}
                    size={[2.0, 7.8]}
                    opacity={quality === 'low' ? 0.16 : 0.26}
                    prefersReducedMotion={prefersReducedMotion}
                    phase={1.6}
                />
                <SunShaft
                    position={[-3.05, 2.35, -4.65]}
                    rotation={[-0.04, -0.08, -0.79]}
                    size={[1.55, 7.4]}
                    opacity={quality === 'low' ? 0.13 : 0.2}
                    prefersReducedMotion={prefersReducedMotion}
                    phase={3.1}
                />
            </group>

            {/* Manchas de sol projetadas no piso pelo caixilho da janela */}
            <group position={[-1.4, 0.012, -5.75]} rotation={[-Math.PI / 2, 0, 0.08]}>
                {[-1.15, 0, 1.15].map((zOff, i) => (
                    <mesh key={i} position={[0, zOff, 0]} renderOrder={2}>
                        <planeGeometry args={[3.4, 0.92]} />
                        <meshBasicMaterial
                            color="#FFF0D1"
                            transparent
                            opacity={0.14}
                            depthWrite={false}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                ))}
            </group>

            {/* Particulas de poeira dourada flutuando nos raios solares */}
            {quality !== 'low' && !prefersReducedMotion && (
                <Sparkles
                    count={quality === 'high' ? 46 : 22}
                    scale={[8.5, 4.4, 6.5]}
                    position={[-1.5, 2.5, -5.5]}
                    size={2.2}
                    speed={0.16}
                    opacity={0.55}
                    color="#FFF1D6"
                />
            )}

            {quality !== 'low' && (
                <ContactShadows
                    position={[0, 0.004, -5.2]}
                    scale={14}
                    blur={2.4}
                    opacity={0.38}
                    far={4.5}
                    color="#2B1B14"
                />
            )}
        </>
    )
}
