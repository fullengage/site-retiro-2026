import { useMemo, useState } from 'react'
import { Text } from '@react-three/drei'
import {
    createNoticeBoardTexture,
    getWalnutTextures,
    useCommunityLogoTexture,
} from './materials'
import { PALETTE, type FocusTargetId } from './types'

interface SanctuaryWallProps {
    info: string[]
    hasSchedule: boolean
    focusedTarget: FocusTargetId
    onFocusTarget: (target: FocusTargetId, openPanel?: boolean) => void
}

export function SanctuaryWall({
    info,
    hasSchedule,
    focusedTarget,
    onFocusTarget,
}: SanctuaryWallProps) {
    const walnut = useMemo(() => getWalnutTextures(), [])
    const noticeTex = useMemo(() => createNoticeBoardTexture(info), [info])
    const logoTex = useCommunityLogoTexture('/images/logo-comunidade-emblema.png', '#F5E6CC')
    const [boardHovered, setBoardHovered] = useState(false)

    const slats = useMemo(() => {
        const arr: number[] = []
        for (let i = -1.25; i <= 1.251; i += 0.14) arr.push(Number(i.toFixed(2)))
        return arr
    }, [])

    const isInfoFocused = focusedTarget === 'informacoes'

    return (
        <group>
            {/* Nicho santuario central em madeira ripada + retroiluminacao dourada */}
            <group position={[0.2, 0, -9.94]}>
                {/* Painel traseiro escuro quente */}
                <mesh position={[0, 2.85, 0.02]} receiveShadow>
                    <boxGeometry args={[2.86, 5.5, 0.05]} />
                    <meshStandardMaterial color="#2E1D15" roughness={0.75} />
                </mesh>

                {/* Fitas LED laterais do nicho */}
                {[-1.4, 1.4].map((xOff, i) => (
                    <mesh key={i} position={[xOff, 2.85, 0.045]}>
                        <boxGeometry args={[0.045, 5.35, 0.02]} />
                        <meshStandardMaterial
                            color="#FFF4DA"
                            emissive="#FFCC80"
                            emissiveIntensity={1.2}
                        />
                    </mesh>
                ))}

                {/* Ripas verticais em nogueira */}
                {slats.map((xPos, i) => (
                    <mesh key={i} position={[xPos, 2.85, 0.055]} castShadow>
                        <boxGeometry args={[0.065, 5.3, 0.035]} />
                        <meshStandardMaterial
                            map={walnut.map}
                            roughness={0.52}
                            color="#5A392B"
                        />
                    </mesh>
                ))}

                {/* Aparador / altar baixo aos pes da cruz com velas e Biblia */}
                <mesh position={[0, 0.42, 0.22]} castShadow receiveShadow>
                    <boxGeometry args={[2.3, 0.14, 0.44]} />
                    <meshStandardMaterial
                        map={walnut.map}
                        bumpMap={walnut.bumpMap}
                        bumpScale={0.012}
                        roughness={0.45}
                    />
                </mesh>
                {[-0.9, 0.9].map((px, i) => (
                    <mesh key={i} position={[px, 0.19, 0.22]} castShadow>
                        <boxGeometry args={[0.1, 0.36, 0.32]} />
                        <meshStandardMaterial color={PALETTE.espresso} roughness={0.5} />
                    </mesh>
                ))}

                {/* Velas liturgicas no altar */}
                {[-0.65, -0.48, 0.54].map((vx, i) => {
                    const h = i === 0 ? 0.26 : i === 1 ? 0.18 : 0.22
                    return (
                        <group key={i} position={[vx, 0.49 + h / 2, 0.22]}>
                            <mesh castShadow>
                                <cylinderGeometry args={[0.042, 0.045, h, 16]} />
                                <meshStandardMaterial color="#F7EBDA" roughness={0.62} />
                            </mesh>
                            <mesh position={[0, h / 2 + 0.035, 0]}>
                                <sphereGeometry args={[0.016, 10, 10]} />
                                <meshStandardMaterial
                                    color="#FFE9B5"
                                    emissive="#FFB347"
                                    emissiveIntensity={2.0}
                                />
                            </mesh>
                        </group>
                    )
                })}

                {/* Medalhao oficial com Logo da Comunidade Voz de Deus no topo do nicho */}
                <group position={[0, 4.48, 0.12]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                        <cylinderGeometry args={[0.56, 0.58, 0.06, 40]} />
                        <meshStandardMaterial color={PALETTE.espresso} roughness={0.38} />
                    </mesh>
                    <mesh position={[0, 0, 0.032]}>
                        <torusGeometry args={[0.55, 0.028, 14, 48]} />
                        <meshStandardMaterial
                            color={PALETTE.brass}
                            metalness={0.88}
                            roughness={0.22}
                        />
                    </mesh>
                    {logoTex && (
                        <mesh position={[0, 0, 0.038]}>
                            <planeGeometry args={[0.84, 0.84]} />
                            <meshStandardMaterial
                                map={logoTex}
                                transparent
                                emissive="#FFE1AE"
                                emissiveIntensity={0.45}
                                roughness={0.3}
                            />
                        </mesh>
                    )}
                    <Text
                        position={[0, -0.74, 0.03]}
                        fontSize={0.125}
                        letterSpacing={0.2}
                        color={PALETTE.cream}
                        anchorX="center"
                        anchorY="middle"
                    >
                        COMUNIDADE VOZ DE DEUS
                    </Text>
                </group>

                {/* Cruz esculpida em madeira nogueira com filete em latao e halo quente */}
                <group position={[0, 2.28, 0.14]}>
                    {/* Halo traseiro suave */}
                    <mesh position={[0, 0.25, -0.04]}>
                        <circleGeometry args={[0.72, 36]} />
                        <meshBasicMaterial color="#FFD696" transparent opacity={0.14} />
                    </mesh>
                    {/* Haste vertical */}
                    <mesh castShadow>
                        <boxGeometry args={[0.16, 2.15, 0.1]} />
                        <meshStandardMaterial
                            map={walnut.map}
                            roughness={0.42}
                            color="#6E4735"
                        />
                    </mesh>
                    <mesh position={[0, 0, 0.055]}>
                        <boxGeometry args={[0.045, 2.02, 0.015]} />
                        <meshStandardMaterial
                            color={PALETTE.brass}
                            metalness={0.88}
                            roughness={0.22}
                        />
                    </mesh>
                    {/* Travessa horizontal */}
                    <mesh position={[0, 0.44, 0]} castShadow>
                        <boxGeometry args={[1.32, 0.16, 0.1]} />
                        <meshStandardMaterial
                            map={walnut.map}
                            roughness={0.42}
                            color="#6E4735"
                        />
                    </mesh>
                    <mesh position={[0, 0.44, 0.055]}>
                        <boxGeometry args={[1.22, 0.045, 0.015]} />
                        <meshStandardMaterial
                            color={PALETTE.brass}
                            metalness={0.88}
                            roughness={0.22}
                        />
                    </mesh>
                </group>
            </group>

            {/* Quadro interativo de Programacao & Avisos a esquerda do nicho */}
            {hasSchedule && (
                <group
                    position={[-3.05, 2.85, -9.92]}
                    scale={boardHovered || isInfoFocused ? 1.03 : 1}
                    onClick={e => {
                        e.stopPropagation()
                        onFocusTarget('informacoes', isInfoFocused)
                    }}
                    onPointerOver={e => {
                        e.stopPropagation()
                        setBoardHovered(true)
                        document.body.style.cursor = 'pointer'
                    }}
                    onPointerOut={() => {
                        setBoardHovered(false)
                        document.body.style.cursor = ''
                    }}
                >
                    {/* Moldura de nogueira */}
                    <mesh castShadow>
                        <boxGeometry args={[1.82, 2.22, 0.07]} />
                        <meshStandardMaterial
                            map={walnut.map}
                            roughness={0.46}
                        />
                    </mesh>
                    {/* Filete interno em latao */}
                    <mesh position={[0, 0, 0.025]}>
                        <boxGeometry args={[1.64, 2.04, 0.03]} />
                        <meshStandardMaterial color={PALETTE.brass} metalness={0.82} roughness={0.28} />
                    </mesh>
                    {/* Cartaz de programacao em papel creme */}
                    <mesh position={[0, 0, 0.045]}>
                        <planeGeometry args={[1.56, 1.96]} />
                        <meshStandardMaterial
                            map={noticeTex}
                            roughness={0.72}
                            emissive={boardHovered || isInfoFocused ? '#FFE1AE' : '#000000'}
                            emissiveIntensity={boardHovered || isInfoFocused ? 0.08 : 0}
                        />
                    </mesh>
                    {/* Luminaria de quadro em latao */}
                    <group position={[0, 1.24, 0.16]}>
                        <mesh rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[0.028, 0.028, 0.72, 12]} />
                            <meshStandardMaterial color={PALETTE.brass} metalness={0.86} roughness={0.24} />
                        </mesh>
                        <mesh position={[0, -0.01, -0.08]} rotation={[Math.PI / 2, 0, 0]}>
                            <cylinderGeometry args={[0.015, 0.015, 0.18, 10]} />
                            <meshStandardMaterial color={PALETTE.brass} metalness={0.86} roughness={0.24} />
                        </mesh>
                    </group>
                </group>
            )}
        </group>
    )
}
