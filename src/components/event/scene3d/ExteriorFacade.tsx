import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
    getCreamPlasterTextures,
    getTravertineTextures,
    getWalnutTextures,
} from './materials'
import { PALETTE, type QualityTier } from './types'

const ARCH_W = 2.46
const ARCH_RECT = 2.25

function smoothstep(t: number) {
    const c = Math.min(1, Math.max(0, t))
    return c * c * (3 - 2 * c)
}

function ArchitecturalPot({ x, z }: { x: number; z: number }) {
    const potGeo = useMemo(() => {
        const pts = [
            new THREE.Vector2(0.0, 0.0),
            new THREE.Vector2(0.24, 0.0),
            new THREE.Vector2(0.32, 0.22),
            new THREE.Vector2(0.38, 0.56),
            new THREE.Vector2(0.34, 0.68),
            new THREE.Vector2(0.41, 0.72),
            new THREE.Vector2(0.41, 0.78),
            new THREE.Vector2(0.33, 0.78),
            new THREE.Vector2(0.31, 0.68),
        ]
        return new THREE.LatheGeometry(pts, 28)
    }, [])

    const leaves = useMemo(() => {
        const items: { rotY: number; tilt: number; height: number; scale: number; shade: string }[] = []
        const shades = ['#4E6142', '#5F7450', '#6E855D', '#435439']
        for (let i = 0; i < 18; i++) {
            const layer = i < 7 ? 0 : i < 13 ? 1 : 2
            items.push({
                rotY: (i * 2.39996) % (Math.PI * 2),
                tilt: 0.35 + layer * 0.28 + (i % 3) * 0.08,
                height: 0.78 + (2 - layer) * 0.14,
                scale: 0.78 + (2 - layer) * 0.18,
                shade: shades[i % shades.length],
            })
        }
        return items
    }, [])

    return (
        <group position={[x, 0, z]}>
            <mesh geometry={potGeo} castShadow receiveShadow>
                <meshStandardMaterial color="#8A523B" roughness={0.78} metalness={0.04} />
            </mesh>
            {/* Solo escuro */}
            <mesh position={[0, 0.71, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.31, 20]} />
                <meshStandardMaterial color="#2C1D15" roughness={0.95} />
            </mesh>
            {/* Folhagem organica em camadas */}
            {leaves.map((lf, idx) => (
                <group key={idx} position={[0, lf.height, 0]} rotation={[0, lf.rotY, 0]}>
                    <mesh
                        position={[0, 0.24 * lf.scale, 0.14 * lf.scale]}
                        rotation={[lf.tilt, 0, 0]}
                        scale={[0.14 * lf.scale, 0.42 * lf.scale, 0.05 * lf.scale]}
                        castShadow
                    >
                        <sphereGeometry args={[1, 10, 8]} />
                        <meshStandardMaterial color={lf.shade} roughness={0.72} />
                    </mesh>
                </group>
            ))}
        </group>
    )
}

function FacadeSconce({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh>
                <boxGeometry args={[0.12, 0.24, 0.06]} />
                <meshStandardMaterial color={PALETTE.brass} metalness={0.82} roughness={0.28} />
            </mesh>
            <mesh position={[0, 0.03, 0.08]}>
                <cylinderGeometry args={[0.055, 0.045, 0.26, 16]} />
                <meshStandardMaterial
                    color="#FFF4DC"
                    emissive="#FFCE86"
                    emissiveIntensity={1.15}
                    roughness={0.25}
                />
            </mesh>
        </group>
    )
}

export function ExteriorFacade({
    openRef,
    quality,
}: {
    openRef: { current: number }
    quality: QualityTier
}) {
    const plaster = useMemo(() => getCreamPlasterTextures(), [])
    const walnut = useMemo(() => getWalnutTextures(), [])
    const travertine = useMemo(() => getTravertineTextures(), [])

    const leftDoorRef = useRef<THREE.Group>(null)
    const rightDoorRef = useRef<THREE.Group>(null)

    const { wallGeo, archFrameGeo } = useMemo(() => {
        const wall = new THREE.Shape()
        wall.moveTo(-8.5, 0)
        wall.lineTo(8.5, 0)
        wall.lineTo(8.5, 7.2)
        wall.lineTo(-8.5, 7.2)
        wall.closePath()

        const hole = new THREE.Path()
        hole.moveTo(-ARCH_W / 2, 0)
        hole.lineTo(-ARCH_W / 2, ARCH_RECT)
        hole.absarc(0, ARCH_RECT, ARCH_W / 2, Math.PI, 0, true)
        hole.lineTo(ARCH_W / 2, 0)
        hole.closePath()
        wall.holes.push(hole)

        const wGeo = new THREE.ExtrudeGeometry(wall, { depth: 0.42, bevelEnabled: false })

        const makeArch = (w: number, rectH: number) => {
            const p = new THREE.Path()
            p.moveTo(-w / 2, 0)
            p.lineTo(-w / 2, rectH)
            p.absarc(0, rectH, w / 2, Math.PI, 0, true)
            p.lineTo(w / 2, 0)
            p.closePath()
            return p
        }
        const outer = new THREE.Shape(makeArch(ARCH_W + 0.38, ARCH_RECT).getPoints(72))
        outer.holes.push(makeArch(ARCH_W, ARCH_RECT))
        const fGeo = new THREE.ExtrudeGeometry(outer, {
            depth: 0.16,
            bevelEnabled: true,
            bevelSize: 0.03,
            bevelThickness: 0.03,
            bevelSegments: 2,
        })
        return { wallGeo: wGeo, archFrameGeo: fGeo }
    }, [])

    useFrame((_, dt) => {
        const target = smoothstep(openRef.current) * THREE.MathUtils.degToRad(104)
        if (leftDoorRef.current) {
            leftDoorRef.current.rotation.y = THREE.MathUtils.damp(
                leftDoorRef.current.rotation.y,
                -target,
                5.5,
                dt
            )
        }
        if (rightDoorRef.current) {
            rightDoorRef.current.rotation.y = THREE.MathUtils.damp(
                rightDoorRef.current.rotation.y,
                target,
                5.5,
                dt
            )
        }
    })

    const renderDoorLeaf = (side: 1 | -1) => {
        const w = ARCH_W / 2 - 0.015
        const cx = (side * ARCH_W) / 4
        return (
            <group position={[cx, ARCH_RECT / 2, 0]}>
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[w, ARCH_RECT - 0.02, 0.09]} />
                    <meshStandardMaterial
                        map={walnut.map}
                        bumpMap={walnut.bumpMap}
                        bumpScale={0.015}
                        roughnessMap={walnut.roughnessMap}
                        roughness={0.5}
                    />
                </mesh>
                {/* Almofadas decorativas (shaker panels) */}
                {[0.58, -0.58].map((py, idx) => (
                    <mesh key={idx} position={[0, py, 0.048]} castShadow>
                        <boxGeometry args={[w * 0.68, 0.88, 0.025]} />
                        <meshStandardMaterial color="#462B1F" roughness={0.48} />
                    </mesh>
                ))}
                {/* Puxador vertical em latao escovado */}
                <mesh position={[side * (w * 0.34), -0.05, 0.08]}>
                    <cylinderGeometry args={[0.018, 0.018, 0.56, 12]} />
                    <meshStandardMaterial color={PALETTE.brass} metalness={0.86} roughness={0.24} />
                </mesh>
            </group>
        )
    }

    return (
        <group>
            {/* Patio externo em travertino */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 5.2]} receiveShadow>
                <planeGeometry args={[18, 10.6]} />
                <meshStandardMaterial
                    map={travertine.map}
                    bumpMap={travertine.bumpMap}
                    bumpScale={0.012}
                    roughnessMap={travertine.roughnessMap}
                    roughness={0.74}
                />
            </mesh>

            {/* Degrau / soleira de pedra na entrada */}
            <mesh position={[0, 0.03, 0.25]} receiveShadow>
                <boxGeometry args={[ARCH_W + 0.8, 0.06, 0.85]} />
                <meshStandardMaterial color="#C9B29A" roughness={0.68} />
            </mesh>

            {/* Parede da fachada com arco */}
            <mesh geometry={wallGeo} position={[0, 0, -0.21]} castShadow receiveShadow>
                <meshStandardMaterial
                    map={plaster.map}
                    bumpMap={plaster.bumpMap}
                    bumpScale={0.01}
                    color="#D9C3AC"
                    roughness={0.88}
                />
            </mesh>

            {/* Moldura chanfrada creme ao redor do arco */}
            <mesh geometry={archFrameGeo} position={[0, 0, 0.16]} castShadow>
                <meshStandardMaterial color={PALETTE.cream} roughness={0.55} />
            </mesh>

            {/* Pilastras laterais e cornija superior */}
            {[-4.2, 4.2].map((px, i) => (
                <mesh key={i} position={[px, 3.4, 0.22]} castShadow receiveShadow>
                    <boxGeometry args={[0.38, 6.8, 0.14]} />
                    <meshStandardMaterial color="#E6D5C0" roughness={0.62} />
                </mesh>
            ))}
            <mesh position={[0, 6.95, 0.26]} castShadow>
                <boxGeometry args={[17.2, 0.36, 0.28]} />
                <meshStandardMaterial color={PALETTE.cream} roughness={0.58} />
            </mesh>

            {/* Portas duplas em madeira nogueira */}
            <group ref={leftDoorRef} position={[-ARCH_W / 2, 0, 0.1]}>
                {renderDoorLeaf(1)}
            </group>
            <group ref={rightDoorRef} position={[ARCH_W / 2, 0, 0.1]}>
                {renderDoorLeaf(-1)}
            </group>

            {/* Bandeira semicircular de vidro luminoso com grade radial em latao */}
            <group position={[0, ARCH_RECT, 0.12]}>
                <mesh>
                    <circleGeometry args={[ARCH_W / 2 - 0.02, 48, 0, Math.PI]} />
                    <meshStandardMaterial
                        color="#FFF4DC"
                        emissive="#FFCF86"
                        emissiveIntensity={quality === 'low' ? 0.7 : 0.95}
                        roughness={0.2}
                    />
                </mesh>
                <mesh position={[0, 0, 0.012]}>
                    <torusGeometry args={[ARCH_W * 0.25, 0.012, 8, 32, Math.PI]} />
                    <meshStandardMaterial color={PALETTE.brass} metalness={0.8} roughness={0.3} />
                </mesh>
                {[-0.65, 0, 0.65].map((ang, i) => {
                    const r = ARCH_W / 2 - 0.06
                    return (
                        <mesh
                            key={i}
                            rotation={[0, 0, ang]}
                            position={[-Math.sin(ang) * (r * 0.5), Math.cos(ang) * (r * 0.5), 0.012]}
                        >
                            <boxGeometry args={[0.02, r, 0.016]} />
                            <meshStandardMaterial color={PALETTE.brass} metalness={0.8} roughness={0.3} />
                        </mesh>
                    )
                })}
            </group>

            {/* Arandelas externas flanqueando a porta */}
            <FacadeSconce position={[-1.78, 2.35, 0.25]} />
            <FacadeSconce position={[1.78, 2.35, 0.25]} />

            {/* Vasos de terracota nas extremidades para nao colidir com os textos laterais */}
            <ArchitecturalPot x={-3.15} z={1.15} />
            <ArchitecturalPot x={3.15} z={1.15} />
        </group>
    )
}
