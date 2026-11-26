import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
    createVinylCoverTexture,
    getVinylGrooveTextures,
    getWalnutTextures,
    useCommunityLogoTexture,
} from './materials'
import { PALETTE, type FocusTargetId, type QualityTier } from './types'

interface TurntableCornerProps {
    isPlaying: boolean
    focusedTarget: FocusTargetId
    quality: QualityTier
    prefersReducedMotion: boolean
    onFocusTarget: (target: FocusTargetId, openPanel?: boolean) => void
    onTogglePlay: () => void
}

const SHELF_COVERS = [
    { title: 'Tribus da Cruz', sub: 'Adoracao & Casa', top: '#6E3E2A', bot: '#24140D', acc: '#E69F56' },
    { title: 'A Casa que Acolhe', sub: 'Retiro DNA 2026', top: '#8B6A55', bot: '#3E271E', acc: '#F3E7D6' },
    { title: 'Voz de Deus', sub: 'Comunhao', top: '#B56345', bot: '#462218', acc: '#FFE1AE' },
    { title: 'Caminho de Luz', sub: 'Espiritualidade', top: '#4D5E4A', bot: '#222B21', acc: '#E5CFAF' },
    { title: 'Servir no Amor', sub: 'Familia', top: '#785038', bot: '#2B1B14', acc: '#D9A760' },
    { title: 'Novo Amanhecer', sub: 'Louvor', top: '#9C7453', bot: '#3B261C', acc: '#FAF3E8' },
]

function BacklitVinylShelves({ onClick }: { onClick: () => void }) {
    const covers = useMemo(
        () =>
            SHELF_COVERS.map(c =>
                createVinylCoverTexture(c.title, c.sub, c.top, c.bot, c.acc)
            ),
        []
    )

    return (
        <group
            position={[5.92, 1.98, -6.5]}
            rotation={[0, -Math.PI / 2, 0]}
            onClick={e => {
                e.stopPropagation()
                onClick()
            }}
        >
            {[0, 0.82].map((yOff, shelfIdx) => (
                <group key={shelfIdx} position={[0, yOff, 0]}>
                    {/* Trilho metalico escuro */}
                    <mesh position={[0, 0, 0.05]} castShadow>
                        <boxGeometry args={[2.15, 0.06, 0.14]} />
                        <meshStandardMaterial color="#1F1510" roughness={0.45} metalness={0.5} />
                    </mesh>
                    {/* Fita LED quente na base da prateleira */}
                    <mesh position={[0, 0.032, 0.06]}>
                        <boxGeometry args={[2.06, 0.015, 0.04]} />
                        <meshStandardMaterial
                            color="#FFF1D0"
                            emissive="#FFB65C"
                            emissiveIntensity={1.6}
                        />
                    </mesh>
                    {/* 3 capas de vinil por prateleira */}
                    {[-0.68, 0, 0.68].map((xOff, idx) => {
                        const coverTex = covers[shelfIdx * 3 + idx]
                        return (
                            <mesh
                                key={idx}
                                position={[xOff, 0.34, 0.05]}
                                rotation={[-0.08, 0, 0]}
                                castShadow
                            >
                                <boxGeometry args={[0.58, 0.58, 0.025]} />
                                <meshStandardMaterial
                                    map={coverTex}
                                    roughness={0.55}
                                    emissive="#FFCF86"
                                    emissiveIntensity={0.07}
                                />
                            </mesh>
                        )
                    })}
                </group>
            ))}
        </group>
    )
}

function BrassLamp({ position }: { position: [number, number, number] }) {
    const domeGeo = useMemo(() => {
        const pts = [
            new THREE.Vector2(0.0, 0.2),
            new THREE.Vector2(0.14, 0.18),
            new THREE.Vector2(0.24, 0.08),
            new THREE.Vector2(0.26, 0.0),
            new THREE.Vector2(0.24, 0.0),
            new THREE.Vector2(0.12, 0.14),
        ]
        return new THREE.LatheGeometry(pts, 28)
    }, [])

    return (
        <group position={position}>
            <mesh position={[0, 0.02, 0]} castShadow>
                <cylinderGeometry args={[0.12, 0.14, 0.04, 24]} />
                <meshStandardMaterial color={PALETTE.brass} metalness={0.86} roughness={0.22} />
            </mesh>
            <mesh position={[0, 0.25, 0]} castShadow>
                <cylinderGeometry args={[0.018, 0.022, 0.44, 14]} />
                <meshStandardMaterial color={PALETTE.brass} metalness={0.86} roughness={0.22} />
            </mesh>
            <mesh geometry={domeGeo} position={[0, 0.44, 0]} castShadow>
                <meshStandardMaterial
                    color={PALETTE.brass}
                    metalness={0.84}
                    roughness={0.24}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <mesh position={[0, 0.41, 0]}>
                <sphereGeometry args={[0.06, 14, 12]} />
                <meshStandardMaterial
                    color="#FFF4D8"
                    emissive="#FFC26A"
                    emissiveIntensity={1.8}
                />
            </mesh>
        </group>
    )
}

function VintageHeadphones({ position }: { position: [number, number, number] }) {
    return (
        <group position={position} rotation={[Math.PI / 2 - 0.12, 0.35, 0.1]}>
            <mesh>
                <torusGeometry args={[0.11, 0.018, 10, 24, Math.PI]} />
                <meshStandardMaterial color="#4A2E22" roughness={0.55} />
            </mesh>
            {[-0.11, 0.11].map((xOff, i) => (
                <group key={i} position={[xOff, -0.02, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <mesh castShadow>
                        <cylinderGeometry args={[0.055, 0.055, 0.04, 18]} />
                        <meshStandardMaterial color={PALETTE.espresso} roughness={0.45} />
                    </mesh>
                    <mesh position={[0, 0.024, 0]}>
                        <cylinderGeometry args={[0.038, 0.038, 0.012, 16]} />
                        <meshStandardMaterial color={PALETTE.brass} metalness={0.85} roughness={0.26} />
                    </mesh>
                </group>
            ))}
        </group>
    )
}

export function TurntableCorner({
    isPlaying,
    focusedTarget,
    quality,
    prefersReducedMotion,
    onFocusTarget,
    onTogglePlay,
}: TurntableCornerProps) {
    const walnut = useMemo(() => getWalnutTextures(), [])
    const vinylTex = useMemo(() => getVinylGrooveTextures(), [])
    const emblemTex = useCommunityLogoTexture('/images/logo-comunidade-emblema.png', '#2B1B14')
    const [hovered, setHovered] = useState(false)

    const platterRef = useRef<THREE.Group>(null)
    const armRef = useRef<THREE.Group>(null)

    // Geometria em S realista para o braco da vitrola (Tonearm)
    const tonearmGeo = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0.04, -0.05),
            new THREE.Vector3(0, 0.045, 0.08),
            new THREE.Vector3(-0.025, 0.042, 0.2),
            new THREE.Vector3(-0.075, 0.036, 0.3),
        ])
        return new THREE.TubeGeometry(curve, 20, 0.0085, 10, false)
    }, [])

    useFrame((_, dt) => {
        if (platterRef.current && isPlaying && !prefersReducedMotion) {
            platterRef.current.rotation.y -= dt * 2.1
        }
        if (armRef.current) {
            // Em repouso: angulo aberto fora do disco; tocando: sobre os sulcos
            const targetYaw = isPlaying ? 0.36 : -0.08
            const targetPitch = isPlaying ? 0.035 : -0.045
            armRef.current.rotation.y = THREE.MathUtils.damp(
                armRef.current.rotation.y,
                targetYaw,
                6,
                dt
            )
            armRef.current.rotation.x = THREE.MathUtils.damp(
                armRef.current.rotation.x,
                targetPitch,
                6,
                dt
            )
        }
    })

    const isFocused = focusedTarget === 'musicas'
    const lpColors = ['#C9B19C', '#5A3B2E', '#B56345', '#F3E7D6', '#8B6A55', '#3B251C', '#D4A56A']

    const handleInteract = () => {
        if (!isFocused) {
            onFocusTarget('musicas', false)
        } else {
            onTogglePlay()
        }
    }

    return (
        <group>
            {/* Aparador Mid-Century em nogueira (encostado a parede direita x = 5.52, z = -6.5) */}
            <group position={[5.48, 0, -6.5]} rotation={[0, -Math.PI / 2, 0]}>
                {/* Pes conicos com ponteiras em latao */}
                {[
                    [-0.86, -0.32],
                    [0.86, -0.32],
                    [-0.86, 0.32],
                    [0.86, 0.32],
                ].map(([lx, lz], i) => (
                    <group key={i} position={[lx, 0, lz]}>
                        <mesh position={[0, 0.14, 0]} castShadow>
                            <cylinderGeometry args={[0.028, 0.017, 0.28, 12]} />
                            <meshStandardMaterial color={PALETTE.espresso} roughness={0.5} />
                        </mesh>
                        <mesh position={[0, 0.025, 0]}>
                            <cylinderGeometry args={[0.019, 0.016, 0.05, 12]} />
                            <meshStandardMaterial color={PALETTE.brass} metalness={0.86} roughness={0.24} />
                        </mesh>
                    </group>
                ))}

                {/* Caixa principal do aparador */}
                <mesh position={[0, 0.57, 0]} castShadow receiveShadow>
                    <boxGeometry args={[2.0, 0.58, 0.82]} />
                    <meshStandardMaterial
                        map={walnut.map}
                        bumpMap={walnut.bumpMap}
                        bumpScale={0.015}
                        roughnessMap={walnut.roughnessMap}
                        roughness={0.46}
                    />
                </mesh>

                {/* Nicho interno escuro para discos LPs */}
                <mesh position={[-0.36, 0.55, 0.05]}>
                    <boxGeometry args={[1.08, 0.44, 0.74]} />
                    <meshStandardMaterial color="#24150F" roughness={0.85} />
                </mesh>

                {/* Discos de vinil empilhados verticalmente no nicho */}
                {Array.from({ length: 16 }, (_, i) => (
                    <mesh
                        key={i}
                        position={[-0.82 + i * 0.036, 0.54, 0.14]}
                        rotation={[0, 0, (i % 3 === 0 ? 0.04 : -0.02)]}
                    >
                        <boxGeometry args={[0.022, 0.38, 0.38]} />
                        <meshStandardMaterial color={lpColors[i % lpColors.length]} roughness={0.75} />
                    </mesh>
                ))}

                {/* Porta direita do aparador */}
                <mesh position={[0.56, 0.55, 0.42]} castShadow>
                    <boxGeometry args={[0.72, 0.48, 0.025]} />
                    <meshStandardMaterial color="#4D3023" roughness={0.48} />
                </mesh>
                <mesh position={[0.28, 0.55, 0.44]}>
                    <sphereGeometry args={[0.018, 12, 12]} />
                    <meshStandardMaterial color={PALETTE.brass} metalness={0.86} roughness={0.22} />
                </mesh>

                {/* Abajur de latao escovado */}
                <BrassLamp position={[-0.72, 0.86, -0.14]} />

                {/* Fones de ouvido vintage */}
                <VintageHeadphones position={[0.68, 0.88, 0.18]} />

                {/* VITROLA HI-FI DETALHADA */}
                <group
                    position={[0.02, 0.86, 0.03]}
                    scale={hovered || isFocused ? 1.025 : 1}
                    onClick={e => {
                        e.stopPropagation()
                        handleInteract()
                    }}
                    onPointerOver={e => {
                        e.stopPropagation()
                        setHovered(true)
                        document.body.style.cursor = 'pointer'
                    }}
                    onPointerOut={() => {
                        setHovered(false)
                        document.body.style.cursor = ''
                    }}
                >
                    {/* Pes isoladores em latao */}
                    {[
                        [-0.31, -0.23],
                        [0.31, -0.23],
                        [-0.31, 0.23],
                        [0.31, 0.23],
                    ].map(([px, pz], i) => (
                        <mesh key={i} position={[px, 0.015, pz]}>
                            <cylinderGeometry args={[0.03, 0.034, 0.03, 16]} />
                            <meshStandardMaterial color={PALETTE.brass} metalness={0.86} roughness={0.25} />
                        </mesh>
                    ))}

                    {/* Plinto em madeira nogueira */}
                    <mesh position={[0, 0.075, 0]} castShadow receiveShadow>
                        <boxGeometry args={[0.74, 0.09, 0.56]} />
                        <meshStandardMaterial
                            map={walnut.map}
                            roughness={0.4}
                            color="#5B392A"
                        />
                    </mesh>

                    {/* Deck superior em aluminio preto acetinado */}
                    <mesh position={[0, 0.125, 0]} receiveShadow>
                        <boxGeometry args={[0.68, 0.014, 0.5]} />
                        <meshStandardMaterial color="#1A1513" roughness={0.34} metalness={0.45} />
                    </mesh>

                    {/* Prato + Disco giratorio */}
                    <group ref={platterRef} position={[-0.08, 0.142, 0]}>
                        {/* Prato com borda em latao */}
                        <mesh castShadow>
                            <cylinderGeometry args={[0.215, 0.222, 0.022, 48]} />
                            <meshStandardMaterial color={PALETTE.brass} metalness={0.8} roughness={0.28} />
                        </mesh>
                        {/* Disco de vinil 12" com sulcos */}
                        <mesh position={[0, 0.015, 0]}>
                            <cylinderGeometry args={[0.205, 0.205, 0.008, 48]} />
                            <meshStandardMaterial
                                map={vinylTex.map}
                                bumpMap={vinylTex.bumpMap}
                                bumpScale={0.006}
                                roughness={0.24}
                                metalness={0.35}
                            />
                        </mesh>
                        {/* Selo central dourado com emblema da Comunidade */}
                        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                            <circleGeometry args={[0.068, 32]} />
                            <meshStandardMaterial color="#E6C38E" roughness={0.45} />
                        </mesh>
                        {emblemTex && (
                            <mesh position={[0, 0.021, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                                <planeGeometry args={[0.08, 0.08]} />
                                <meshStandardMaterial map={emblemTex} transparent roughness={0.4} />
                            </mesh>
                        )}
                        {/* Pino central cromado */}
                        <mesh position={[0, 0.03, 0]}>
                            <cylinderGeometry args={[0.006, 0.006, 0.025, 12]} />
                            <meshStandardMaterial color="#E8DFD4" metalness={0.95} roughness={0.15} />
                        </mesh>
                    </group>

                    {/* Conjunto do braco (Tonearm) animado */}
                    <group position={[0.21, 0.14, -0.15]}>
                        {/* Base gimbal */}
                        <mesh>
                            <cylinderGeometry args={[0.042, 0.048, 0.032, 20]} />
                            <meshStandardMaterial color="#241C18" metalness={0.7} roughness={0.3} />
                        </mesh>
                        <group ref={armRef} position={[0, 0.02, 0]}>
                            {/* Contrapeso traseiro em latao */}
                            <mesh position={[0, 0.04, -0.045]} rotation={[Math.PI / 2, 0, 0]}>
                                <cylinderGeometry args={[0.022, 0.022, 0.036, 16]} />
                                <meshStandardMaterial color={PALETTE.brass} metalness={0.88} roughness={0.22} />
                            </mesh>
                            {/* Tubo em S */}
                            <mesh geometry={tonearmGeo}>
                                <meshStandardMaterial color="#D9C7B0" metalness={0.9} roughness={0.18} />
                            </mesh>
                            {/* Headshell e capsula com detalhe vermelho */}
                            <group position={[-0.078, 0.033, 0.308]} rotation={[0, -0.35, 0]}>
                                <mesh>
                                    <boxGeometry args={[0.022, 0.012, 0.04]} />
                                    <meshStandardMaterial color="#181210" roughness={0.4} metalness={0.5} />
                                </mesh>
                                <mesh position={[0, -0.01, 0.01]}>
                                    <boxGeometry args={[0.014, 0.01, 0.018]} />
                                    <meshStandardMaterial color="#C84630" roughness={0.35} />
                                </mesh>
                            </group>
                        </group>
                    </group>

                    {/* Knobs rotativos de volume/pitch em latao e LED indicador */}
                    {[0.16, 0.25].map((kx, i) => (
                        <mesh key={i} position={[kx, 0.142, 0.19]}>
                            <cylinderGeometry args={[0.022, 0.024, 0.022, 18]} />
                            <meshStandardMaterial color={PALETTE.brass} metalness={0.88} roughness={0.22} />
                        </mesh>
                    ))}
                    <mesh position={[-0.27, 0.138, 0.2]}>
                        <sphereGeometry args={[0.008, 10, 10]} />
                        <meshStandardMaterial
                            color={isPlaying ? '#FFB84D' : '#6B4834'}
                            emissive={isPlaying ? '#FF9D2E' : '#000000'}
                            emissiveIntensity={isPlaying ? 2.4 : 0}
                        />
                    </mesh>

                    {/* Tampa acrilica levantada a 60 graus */}
                    <group position={[0, 0.13, -0.25]} rotation={[-1.02, 0, 0]}>
                        <mesh position={[0, 0.24, 0]}>
                            <boxGeometry args={[0.68, 0.48, 0.012]} />
                            <meshStandardMaterial
                                color="#FAF2E6"
                                transparent
                                opacity={quality === 'high' ? 0.24 : 0.2}
                                roughness={0.08}
                                metalness={0.2}
                            />
                        </mesh>
                    </group>
                </group>
            </group>

            {/* Duas prateleiras retroiluminadas com capas de vinil na parede direita */}
            <BacklitVinylShelves onClick={() => onFocusTarget('musicas', false)} />
        </group>
    )
}
