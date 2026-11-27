import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
    getBoucleFabricTextures,
    getCreamPlasterTextures,
    getOakFloorTextures,
    getWalnutTextures,
} from './materials'
import { PALETTE, type QualityTier } from './types'

function WallSconce({
    position,
    rotation = [0, 0, 0],
}: {
    position: [number, number, number]
    rotation?: [number, number, number]
}) {
    return (
        <group position={position} rotation={rotation}>
            <mesh>
                <boxGeometry args={[0.07, 0.52, 0.04]} />
                <meshStandardMaterial color={PALETTE.brass} metalness={0.86} roughness={0.24} />
            </mesh>
            <mesh position={[0, 0, 0.06]}>
                <cylinderGeometry args={[0.032, 0.032, 0.44, 14]} />
                <meshStandardMaterial
                    color="#FFF6E5"
                    emissive="#FFD494"
                    emissiveIntensity={1.15}
                    roughness={0.22}
                />
            </mesh>
        </group>
    )
}

function CurtainPanel({
    position,
    prefersReducedMotion,
    phase = 0,
}: {
    position: [number, number, number]
    prefersReducedMotion: boolean
    phase?: number
}) {
    const ref = useRef<THREE.Group>(null)
    useFrame(({ clock }) => {
        if (!ref.current || prefersReducedMotion) return
        ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.55 + phase) * 0.015
    })

    return (
        <group ref={ref} position={position}>
            {[-0.28, -0.14, 0, 0.14, 0.28].map((zOff, i) => (
                <mesh key={i} position={[0.04 * (i % 2 === 0 ? 1 : -1), -2.4, zOff]} castShadow>
                    <cylinderGeometry args={[0.085, 0.105, 4.85, 12]} />
                    <meshStandardMaterial
                        color="#F4EAD9"
                        roughness={0.92}
                        transparent
                        opacity={0.88}
                    />
                </mesh>
            ))}
        </group>
    )
}

export function RoomArchitecture({
    quality,
    prefersReducedMotion,
}: {
    quality: QualityTier
    prefersReducedMotion: boolean
}) {
    const oak = useMemo(() => getOakFloorTextures(), [])
    const walnut = useMemo(() => getWalnutTextures(), [])
    const plaster = useMemo(() => getCreamPlasterTextures(), [])
    const boucle = useMemo(() => getBoucleFabricTextures(), [])

    const lampRef = useRef<THREE.Group>(null)
    useFrame(({ clock }) => {
        if (!lampRef.current || prefersReducedMotion) return
        lampRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.85) * 0.016
    })

    // Parede esquerda com abertura real para janela panoramica (z: -8.35..-4.45, y: 0.55..5.25)
    // No sistema local da parede rotacionada em Y (+PI/2): localX = -worldZ - 5, localY = worldY
    const leftWallGeo = useMemo(() => {
        const shape = new THREE.Shape()
        shape.moveTo(-5, 0)
        shape.lineTo(5, 0)
        shape.lineTo(5, 6.2)
        shape.lineTo(-5, 6.2)
        shape.closePath()

        const win = new THREE.Path()
        // worldZ = -8.35 -> localX = 3.35; worldZ = -4.45 -> localX = -0.55
        win.moveTo(-0.55, 0.58)
        win.lineTo(3.35, 0.58)
        win.lineTo(3.35, 5.25)
        win.lineTo(-0.55, 5.25)
        win.closePath()
        shape.holes.push(win)

        return new THREE.ExtrudeGeometry(shape, { depth: 0.24, bevelEnabled: false })
    }, [])

    const chandelierShadeGeo = useMemo(() => {
        const pts = [
            new THREE.Vector2(0.06, 0.34),
            new THREE.Vector2(0.18, 0.30),
            new THREE.Vector2(0.46, 0.14),
            new THREE.Vector2(0.62, 0.0),
            new THREE.Vector2(0.58, -0.02),
            new THREE.Vector2(0.42, 0.11),
            new THREE.Vector2(0.14, 0.26),
        ]
        return new THREE.LatheGeometry(pts, 32)
    }, [])

    return (
        <group>
            {/* Piso em tabuas de carvalho quente */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -5]} receiveShadow>
                <planeGeometry args={[12.2, 10.2]} />
                <meshStandardMaterial
                    map={oak.map}
                    bumpMap={oak.bumpMap}
                    bumpScale={0.015}
                    roughnessMap={oak.roughnessMap}
                    roughness={0.58}
                    metalness={0.04}
                />
            </mesh>

            {/* Tapete central em boucle creme com borda */}
            <group position={[-0.45, 0.008, -5.4]}>
                <mesh receiveShadow>
                    <boxGeometry args={[5.4, 0.022, 4.3]} />
                    <meshStandardMaterial
                        map={boucle.map}
                        bumpMap={boucle.bumpMap}
                        bumpScale={0.018}
                        color="#EDE1CF"
                        roughness={0.95}
                    />
                </mesh>
                <mesh position={[0, 0.002, 0]}>
                    <boxGeometry args={[5.12, 0.022, 4.02]} />
                    <meshStandardMaterial
                        map={boucle.map}
                        color="#F4EADC"
                        roughness={0.96}
                    />
                </mesh>
            </group>

            {/* Parede do fundo (z = -10) */}
            <mesh position={[0, 3.1, -10]} receiveShadow>
                <planeGeometry args={[12.2, 6.2]} />
                <meshStandardMaterial
                    map={plaster.map}
                    bumpMap={plaster.bumpMap}
                    bumpScale={0.008}
                    color="#E8D8C3"
                    roughness={0.86}
                />
            </mesh>
            {/* Rodape e boiserie da parede do fundo */}
            <mesh position={[0, 0.1, -9.96]} receiveShadow>
                <boxGeometry args={[12, 0.2, 0.06]} />
                <meshStandardMaterial color={PALETTE.walnut} roughness={0.55} />
            </mesh>
            <mesh position={[0, 1.08, -9.97]}>
                <boxGeometry args={[12, 0.05, 0.04]} />
                <meshStandardMaterial color="#D5C1AA" roughness={0.7} />
            </mesh>

            {/* Parede direita (x = 6) */}
            <mesh position={[6, 3.1, -5]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
                <planeGeometry args={[10.2, 6.2]} />
                <meshStandardMaterial
                    map={plaster.map}
                    bumpMap={plaster.bumpMap}
                    bumpScale={0.008}
                    color="#E2D0BA"
                    roughness={0.88}
                />
            </mesh>
            <mesh position={[5.96, 0.1, -5]} rotation={[0, -Math.PI / 2, 0]}>
                <boxGeometry args={[10, 0.2, 0.06]} />
                <meshStandardMaterial color={PALETTE.walnut} roughness={0.55} />
            </mesh>

            {/* Parede esquerda (x = -6) com janela panoramica */}
            <mesh
                geometry={leftWallGeo}
                position={[-6.24, 0, -5]}
                rotation={[0, Math.PI / 2, 0]}
                castShadow
                receiveShadow
            >
                <meshStandardMaterial
                    map={plaster.map}
                    bumpMap={plaster.bumpMap}
                    bumpScale={0.008}
                    color="#E9DAC6"
                    roughness={0.88}
                />
            </mesh>

            {/* Jardim e ceu dourado fora da janela */}
            <group position={[-7.6, 2.9, -6.4]} rotation={[0, Math.PI / 2, 0]}>
                <mesh>
                    <planeGeometry args={[6.5, 6.5]} />
                    <meshBasicMaterial color="#FFF0D2" />
                </mesh>
                <mesh position={[0, -1.65, 0.2]}>
                    <planeGeometry args={[6.5, 2.2]} />
                    <meshBasicMaterial color="#7C8E67" />
                </mesh>
            </group>

            {/* Esquadrias de bronze da janela */}
            <group position={[-6.02, 2.91, -6.4]}>
                {/* Moldura externa */}
                <mesh position={[0, 2.34, 0]}>
                    <boxGeometry args={[0.14, 0.1, 4.0]} />
                    <meshStandardMaterial color="#38251C" metalness={0.55} roughness={0.4} />
                </mesh>
                <mesh position={[0, -2.34, 0]}>
                    <boxGeometry args={[0.18, 0.1, 4.05]} />
                    <meshStandardMaterial color={PALETTE.cream} roughness={0.6} />
                </mesh>
                {[-1.95, -0.65, 0.65, 1.95].map((zOff, i) => (
                    <mesh key={i} position={[0, 0, zOff]}>
                        <boxGeometry args={[0.1, 4.7, 0.07]} />
                        <meshStandardMaterial color="#38251C" metalness={0.55} roughness={0.4} />
                    </mesh>
                ))}
                {[-1.1, 0.2, 1.45].map((yOff, i) => (
                    <mesh key={i} position={[0, yOff, 0]}>
                        <boxGeometry args={[0.08, 0.05, 3.9]} />
                        <meshStandardMaterial color="#38251C" metalness={0.55} roughness={0.4} />
                    </mesh>
                ))}
                {/* Vidro sutil */}
                <mesh rotation={[0, Math.PI / 2, 0]}>
                    <planeGeometry args={[3.86, 4.6]} />
                    <meshStandardMaterial
                        color="#FFF8EB"
                        transparent
                        opacity={0.14}
                        roughness={0.08}
                        metalness={0.15}
                    />
                </mesh>
            </group>

            {/* Varao e cortinas de linho creme flanqueando a janela */}
            <mesh position={[-5.78, 5.42, -6.4]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.022, 0.022, 4.8, 12]} />
                <meshStandardMaterial color={PALETTE.brass} metalness={0.85} roughness={0.25} />
            </mesh>
            <CurtainPanel position={[-5.76, 5.36, -8.45]} prefersReducedMotion={prefersReducedMotion} phase={0} />
            <CurtainPanel position={[-5.76, 5.36, -4.35]} prefersReducedMotion={prefersReducedMotion} phase={1.7} />

            {/* Teto com vigas de nogueira e sanca iluminada */}
            <mesh position={[0, 6.2, -5]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[12.4, 10.4]} />
                <meshStandardMaterial color="#EFE3D1" roughness={0.9} />
            </mesh>
            {/* Moldura da sanca central */}
            <group position={[0, 6.02, -5]}>
                <mesh>
                    <boxGeometry args={[7.4, 0.14, 5.8]} />
                    <meshStandardMaterial color="#F6ECE0" roughness={0.8} />
                </mesh>
                {/* Brilho LED perimetral da sanca */}
                <mesh position={[0, -0.05, 0]}>
                    <boxGeometry args={[7.52, 0.04, 5.92]} />
                    <meshStandardMaterial
                        color="#FFF3DB"
                        emissive="#FFD592"
                        emissiveIntensity={quality === 'low' ? 0.55 : 0.9}
                    />
                </mesh>
            </group>
            {/* Vigas aparentes em madeira nogueira */}
            {[-8.2, -5.0, -1.8].map((zPos, i) => (
                <mesh key={i} position={[0, 6.08, zPos]} castShadow>
                    <boxGeometry args={[12, 0.2, 0.24]} />
                    <meshStandardMaterial
                        map={walnut.map}
                        roughness={0.58}
                    />
                </mesh>
            ))}

            {/* Lustre pendente alto em latao e alabastro (fora da linha de visao da camera) */}
            <group ref={lampRef} position={[0, 6.0, -5.1]}>
                <mesh position={[0, -0.46, 0]}>
                    <cylinderGeometry args={[0.014, 0.014, 0.92, 10]} />
                    <meshStandardMaterial color={PALETTE.brass} metalness={0.85} roughness={0.25} />
                </mesh>
                <mesh geometry={chandelierShadeGeo} position={[0, -1.04, 0]}>
                    <meshStandardMaterial
                        color={PALETTE.brass}
                        metalness={0.8}
                        roughness={0.28}
                        side={THREE.DoubleSide}
                    />
                </mesh>
                <mesh position={[0, -1.03, 0]}>
                    <sphereGeometry args={[0.16, 20, 14]} />
                    <meshStandardMaterial
                        color="#FFF8E8"
                        emissive="#FFCF86"
                        emissiveIntensity={1.45}
                    />
                </mesh>
            </group>

            {/* Arandelas verticais flanqueando o nicho na parede do fundo */}
            <WallSconce position={[-1.98, 2.75, -9.96]} />
            <WallSconce position={[1.45, 2.75, -9.96]} />
        </group>
    )
}
