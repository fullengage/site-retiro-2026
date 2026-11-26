import { useMemo, useState } from 'react'
import * as THREE from 'three'
import {
    createPosterTexture,
    getBoucleFabricTextures,
    getTravertineTextures,
    getWalnutTextures,
} from './materials'
import { PALETTE, type FocusTargetId } from './types'

interface CommunionFurnitureProps {
    info: string[]
    hasKidsArea: boolean
    hasRegistration: boolean
    focusedTarget: FocusTargetId
    onFocusTarget: (target: FocusTargetId, openPanel?: boolean) => void
}

function BoucleSofa({
    position,
    rotation,
}: {
    position: [number, number, number]
    rotation: [number, number, number]
}) {
    const boucle = useMemo(() => getBoucleFabricTextures(), [])
    const walnut = useMemo(() => getWalnutTextures(), [])

    return (
        <group position={position} rotation={rotation}>
            {/* Base em madeira nogueira com pes torneados */}
            <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
                <boxGeometry args={[2.36, 0.08, 0.96]} />
                <meshStandardMaterial map={walnut.map} roughness={0.48} />
            </mesh>
            {[
                [-1.06, -0.38],
                [1.06, -0.38],
                [-1.06, 0.38],
                [1.06, 0.38],
            ].map(([lx, lz], i) => (
                <mesh key={i} position={[lx, 0.07, lz]} castShadow>
                    <cylinderGeometry args={[0.032, 0.02, 0.14, 12]} />
                    <meshStandardMaterial color={PALETTE.espresso} roughness={0.5} />
                </mesh>
            ))}

            {/* 2 assentos macios arredondados */}
            {[-0.55, 0.55].map((ax, i) => (
                <mesh key={i} position={[ax, 0.3, 0.04]} castShadow receiveShadow>
                    <boxGeometry args={[1.06, 0.22, 0.86]} />
                    <meshStandardMaterial
                        map={boucle.map}
                        bumpMap={boucle.bumpMap}
                        bumpScale={0.018}
                        color="#EFE5D5"
                        roughness={0.94}
                    />
                </mesh>
            ))}

            {/* Encosto acolhedor */}
            <mesh position={[0, 0.62, -0.36]} rotation={[-0.08, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[2.32, 0.56, 0.22]} />
                <meshStandardMaterial
                    map={boucle.map}
                    bumpMap={boucle.bumpMap}
                    bumpScale={0.018}
                    color="#EBE0CE"
                    roughness={0.94}
                />
            </mesh>

            {/* Bracos arredondados */}
            {[-1.12, 1.12].map((bx, i) => (
                <group key={i} position={[bx, 0.45, 0]}>
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={[0.16, 0.44, 0.92]} />
                        <meshStandardMaterial
                            map={boucle.map}
                            color="#EBE0CE"
                            roughness={0.94}
                        />
                    </mesh>
                    <mesh position={[0, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.08, 0.08, 0.92, 14]} />
                        <meshStandardMaterial map={boucle.map} color="#EBE0CE" roughness={0.94} />
                    </mesh>
                </group>
            ))}

            {/* Almofadas soltas (tons terrosos quentes) */}
            <mesh position={[-0.78, 0.54, -0.18]} rotation={[0.25, 0.32, -0.12]} castShadow>
                <boxGeometry args={[0.38, 0.34, 0.12]} />
                <meshStandardMaterial color="#B56345" roughness={0.92} />
            </mesh>
            <mesh position={[0.76, 0.54, -0.18]} rotation={[0.24, -0.3, 0.1]} castShadow>
                <boxGeometry args={[0.38, 0.34, 0.12]} />
                <meshStandardMaterial color="#6E7F6A" roughness={0.92} />
            </mesh>
            {/* Manta de linho drapeada */}
            <mesh position={[0.28, 0.43, 0.35]} rotation={[0.35, 0.12, 0]} castShadow>
                <boxGeometry args={[0.58, 0.06, 0.36]} />
                <meshStandardMaterial color="#C9A885" roughness={0.95} />
            </mesh>
        </group>
    )
}

function CurvedArmchair({
    position,
    rotation,
}: {
    position: [number, number, number]
    rotation: [number, number, number]
}) {
    const boucle = useMemo(() => getBoucleFabricTextures(), [])
    return (
        <group position={position} rotation={rotation}>
            {/* Base giratoria em madeira */}
            <mesh position={[0, 0.09, 0]} castShadow>
                <cylinderGeometry args={[0.38, 0.42, 0.18, 24]} />
                <meshStandardMaterial color={PALETTE.espresso} roughness={0.5} />
            </mesh>
            {/* Assento redondo macio */}
            <mesh position={[0, 0.29, 0.03]} castShadow receiveShadow>
                <cylinderGeometry args={[0.48, 0.45, 0.22, 28]} />
                <meshStandardMaterial
                    map={boucle.map}
                    bumpMap={boucle.bumpMap}
                    bumpScale={0.016}
                    color="#E8DAC6"
                    roughness={0.95}
                />
            </mesh>
            {/* Encosto em arco envolvente */}
            <mesh position={[0, 0.56, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.5, 0.48, 0.44, 28, 1, true, Math.PI * 0.62, Math.PI * 0.76]} />
                <meshStandardMaterial
                    map={boucle.map}
                    color="#E2D2BC"
                    roughness={0.95}
                    side={THREE.DoubleSide}
                />
            </mesh>
            {/* Almofada lombar */}
            <mesh position={[0, 0.48, -0.22]} rotation={[0.18, 0, 0]} castShadow>
                <boxGeometry args={[0.38, 0.26, 0.11]} />
                <meshStandardMaterial color="#9E6245" roughness={0.9} />
            </mesh>
        </group>
    )
}

function CommunionCoffeeTable({ position }: { position: [number, number, number] }) {
    const travertine = useMemo(() => getTravertineTextures(), [])
    const walnut = useMemo(() => getWalnutTextures(), [])

    return (
        <group position={position}>
            {/* Base cilindrica ripada em madeira nogueira */}
            <mesh position={[0, 0.21, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.34, 0.36, 0.42, 24]} />
                <meshStandardMaterial map={walnut.map} roughness={0.5} />
            </mesh>
            {/* Tampo chanfrado em travertino creme */}
            <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.92, 0.89, 0.065, 44]} />
                <meshStandardMaterial
                    map={travertine.map}
                    bumpMap={travertine.bumpMap}
                    bumpScale={0.01}
                    roughness={0.48}
                    color="#EFE2D0"
                />
            </mesh>

            {/* ESPIRITUALIDADE: Biblia aberta sobre a mesa */}
            <group position={[-0.28, 0.5, 0.14]} rotation={[0, 0.35, 0]}>
                <mesh position={[0, 0, 0]} castShadow>
                    <boxGeometry args={[0.42, 0.02, 0.3]} />
                    <meshStandardMaterial color="#3B2319" roughness={0.62} />
                </mesh>
                {/* Paginas abertas inclinadas */}
                <mesh position={[-0.095, 0.022, 0]} rotation={[0, 0, 0.1]} castShadow>
                    <boxGeometry args={[0.19, 0.024, 0.27]} />
                    <meshStandardMaterial color="#FAF3E5" roughness={0.85} />
                </mesh>
                <mesh position={[0.095, 0.022, 0]} rotation={[0, 0, -0.1]} castShadow>
                    <boxGeometry args={[0.19, 0.024, 0.27]} />
                    <meshStandardMaterial color="#F7EFE0" roughness={0.85} />
                </mesh>
                {/* Fita marcadora dourada */}
                <mesh position={[0.03, 0.032, 0.14]}>
                    <boxGeometry args={[0.016, 0.004, 0.14]} />
                    <meshStandardMaterial color={PALETTE.brass} metalness={0.6} roughness={0.35} />
                </mesh>
            </group>

            {/* SERVICO & COMUNHAO: Bandeja de madeira com bule de cafe e duas canecas */}
            <group position={[0.26, 0.5, -0.08]} rotation={[0, -0.25, 0]}>
                <mesh castShadow receiveShadow>
                    <cylinderGeometry args={[0.25, 0.23, 0.025, 24]} />
                    <meshStandardMaterial color="#7B543D" roughness={0.58} />
                </mesh>
                {/* Bule ceramico */}
                <mesh position={[-0.06, 0.095, -0.03]} castShadow>
                    <cylinderGeometry args={[0.055, 0.078, 0.16, 18]} />
                    <meshStandardMaterial color="#F5EBDC" roughness={0.35} />
                </mesh>
                <mesh position={[-0.06, 0.18, -0.03]}>
                    <sphereGeometry args={[0.048, 14, 12]} />
                    <meshStandardMaterial color="#B56345" roughness={0.45} />
                </mesh>
                {/* Duas canecas artesanais */}
                {[
                    [0.09, 0.04],
                    [0.05, -0.1],
                ].map(([mx, mz], i) => (
                    <mesh key={i} position={[mx, 0.055, mz]} castShadow>
                        <cylinderGeometry args={[0.038, 0.032, 0.085, 16]} />
                        <meshStandardMaterial color="#DFCBB2" roughness={0.42} />
                    </mesh>
                ))}
            </group>

            {/* Vela acolhedora + vaso ceramico com folhagem seca */}
            <group position={[0.04, 0.49, -0.36]}>
                <mesh position={[0, 0.05, 0]} castShadow>
                    <cylinderGeometry args={[0.04, 0.042, 0.1, 16]} />
                    <meshStandardMaterial color="#FAF0DF" roughness={0.65} />
                </mesh>
                <mesh position={[0, 0.115, 0]}>
                    <sphereGeometry args={[0.015, 10, 10]} />
                    <meshStandardMaterial color="#FFE9B5" emissive="#FFB347" emissiveIntensity={2.0} />
                </mesh>
            </group>
            <group position={[-0.45, 0.48, -0.32]}>
                <mesh position={[0, 0.08, 0]} castShadow>
                    <cylinderGeometry args={[0.06, 0.085, 0.16, 18]} />
                    <meshStandardMaterial color="#C8A98E" roughness={0.7} />
                </mesh>
                {[-0.18, 0, 0.18].map((ang, i) => (
                    <mesh key={i} position={[ang * 0.2, 0.24, 0]} rotation={[0.1 * i, 0, ang]}>
                        <cylinderGeometry args={[0.008, 0.015, 0.24, 8]} />
                        <meshStandardMaterial color="#E6D5BD" roughness={0.9} />
                    </mesh>
                ))}
            </group>
        </group>
    )
}

function CornerPlant({ position }: { position: [number, number, number] }) {
    const leaves = useMemo(
        () =>
            Array.from({ length: 14 }, (_, i) => ({
                rotY: (i * 2.39996) % (Math.PI * 2),
                tilt: 0.35 + (i % 3) * 0.26,
                h: 0.56 + (i % 3) * 0.18,
                s: 0.8 + (i % 2) * 0.25,
                col: i % 2 === 0 ? '#506643' : '#647B54',
            })),
        []
    )
    return (
        <group position={position}>
            <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.28, 0.2, 0.56, 22]} />
                <meshStandardMaterial color="#D9C7B2" roughness={0.78} />
            </mesh>
            {leaves.map((l, i) => (
                <group key={i} position={[0, l.h, 0]} rotation={[0, l.rotY, 0]}>
                    <mesh
                        position={[0, 0.22 * l.s, 0.14 * l.s]}
                        rotation={[l.tilt, 0, 0]}
                        scale={[0.13 * l.s, 0.38 * l.s, 0.04 * l.s]}
                        castShadow
                    >
                        <sphereGeometry args={[1, 10, 8]} />
                        <meshStandardMaterial color={l.col} roughness={0.72} />
                    </mesh>
                </group>
            ))}
        </group>
    )
}

export function CommunionFurniture({
    info,
    hasKidsArea,
    hasRegistration,
    focusedTarget,
    onFocusTarget,
}: CommunionFurnitureProps) {
    const posterTex = useMemo(() => createPosterTexture(info), [info])
    const walnut = useMemo(() => getWalnutTextures(), [])
    const [kidsHover, setKidsHover] = useState(false)
    const [easelHover, setEaselHover] = useState(false)

    const kidsFocused = focusedTarget === 'criancas'
    const regFocused = focusedTarget === 'inscricao'

    return (
        <group>
            {/* Sofa em boucle creme sob a luz da janela */}
            <BoucleSofa position={[-2.95, 0, -5.65]} rotation={[0, Math.PI / 2 - 0.15, 0]} />

            {/* Poltrona curva de acolhimento */}
            <CurvedArmchair position={[1.45, 0, -6.75]} rotation={[0, -0.55, 0]} />

            {/* Mesa de centro em travertino com Biblia e Cafe */}
            <CommunionCoffeeTable position={[-0.55, 0, -5.5]} />

            {/* Plantas ornamentais nos cantos */}
            <CornerPlant position={[-5.15, 0, -9.15]} />
            <CornerPlant position={[5.15, 0, -9.15]} />

            {/* FAMILIA: Cantinho das Criancas (frente-esquerda) */}
            {hasKidsArea && (
                <group
                    position={[-3.3, 0, -2.5]}
                    scale={kidsHover || kidsFocused ? 1.035 : 1}
                    onClick={e => {
                        e.stopPropagation()
                        onFocusTarget('criancas', kidsFocused)
                    }}
                    onPointerOver={e => {
                        e.stopPropagation()
                        setKidsHover(true)
                        document.body.style.cursor = 'pointer'
                    }}
                    onPointerOut={() => {
                        setKidsHover(false)
                        document.body.style.cursor = ''
                    }}
                >
                    {/* Tapete redondo acolhedor */}
                    <mesh position={[0, 0.016, 0]} receiveShadow>
                        <cylinderGeometry args={[1.18, 1.2, 0.02, 40]} />
                        <meshStandardMaterial color="#F5EBDC" roughness={0.95} />
                    </mesh>
                    {/* Mesinha infantil em madeira clara */}
                    <mesh position={[0, 0.34, 0]} castShadow receiveShadow>
                        <cylinderGeometry args={[0.42, 0.42, 0.04, 28]} />
                        <meshStandardMaterial color="#D9BC9C" roughness={0.62} />
                    </mesh>
                    {[
                        [-0.22, -0.22],
                        [0.22, -0.22],
                        [-0.22, 0.22],
                        [0.22, 0.22],
                    ].map(([lx, lz], i) => (
                        <mesh key={i} position={[lx, 0.16, lz]} castShadow>
                            <cylinderGeometry args={[0.025, 0.02, 0.32, 10]} />
                            <meshStandardMaterial color="#B58E69" roughness={0.6} />
                        </mesh>
                    ))}
                    {/* Blocos de montar em madeira e livrinho */}
                    <mesh position={[-0.12, 0.39, 0.08]} rotation={[0, 0.3, 0]} castShadow>
                        <boxGeometry args={[0.075, 0.075, 0.075]} />
                        <meshStandardMaterial color="#C87E5E" roughness={0.7} />
                    </mesh>
                    <mesh position={[-0.02, 0.39, 0.12]} rotation={[0, -0.2, 0]} castShadow>
                        <boxGeometry args={[0.075, 0.075, 0.075]} />
                        <meshStandardMaterial color="#7D9176" roughness={0.7} />
                    </mesh>
                    <mesh position={[-0.07, 0.465, 0.1]} rotation={[0, 0.6, 0]} castShadow>
                        <boxGeometry args={[0.07, 0.07, 0.07]} />
                        <meshStandardMaterial color="#DFBA7C" roughness={0.7} />
                    </mesh>
                    <mesh position={[0.14, 0.375, -0.08]} rotation={[0, -0.25, 0]} castShadow>
                        <boxGeometry args={[0.2, 0.03, 0.26]} />
                        <meshStandardMaterial color="#8B6A55" roughness={0.72} />
                    </mesh>
                    {/* Pufe macio ao lado da mesinha */}
                    <mesh position={[0.68, 0.16, 0.28]} castShadow receiveShadow>
                        <cylinderGeometry args={[0.26, 0.28, 0.28, 22]} />
                        <meshStandardMaterial color="#C9956B" roughness={0.92} />
                    </mesh>
                </group>
            )}

            {/* Cavalete de Boas-Vindas / Inscricao */}
            {hasRegistration && (
                <group
                    position={[2.35, 0, -3.7]}
                    rotation={[0, -0.45, 0]}
                    scale={easelHover || regFocused ? 1.04 : 1}
                    onClick={e => {
                        e.stopPropagation()
                        onFocusTarget('inscricao', regFocused)
                    }}
                    onPointerOver={e => {
                        e.stopPropagation()
                        setEaselHover(true)
                        document.body.style.cursor = 'pointer'
                    }}
                    onPointerOut={() => {
                        setEaselHover(false)
                        document.body.style.cursor = ''
                    }}
                >
                    {/* Tres pernas do cavalete */}
                    <mesh position={[-0.26, 0.78, 0.05]} rotation={[-0.12, 0, -0.14]} castShadow>
                        <boxGeometry args={[0.045, 1.62, 0.045]} />
                        <meshStandardMaterial map={walnut.map} roughness={0.5} />
                    </mesh>
                    <mesh position={[0.26, 0.78, 0.05]} rotation={[-0.12, 0, 0.14]} castShadow>
                        <boxGeometry args={[0.045, 1.62, 0.045]} />
                        <meshStandardMaterial map={walnut.map} roughness={0.5} />
                    </mesh>
                    <mesh position={[0, 0.75, -0.28]} rotation={[0.38, 0, 0]} castShadow>
                        <boxGeometry args={[0.045, 1.56, 0.045]} />
                        <meshStandardMaterial map={walnut.map} roughness={0.5} />
                    </mesh>
                    {/* Apoio horizontal */}
                    <mesh position={[0, 0.62, 0.12]} rotation={[-0.12, 0, 0]} castShadow>
                        <boxGeometry args={[0.88, 0.05, 0.09]} />
                        <meshStandardMaterial map={walnut.map} roughness={0.5} />
                    </mesh>
                    {/* Cartaz impresso emoldurado */}
                    <group position={[0, 1.12, 0.05]} rotation={[-0.12, 0, 0]}>
                        <mesh castShadow>
                            <boxGeometry args={[0.84, 1.06, 0.04]} />
                            <meshStandardMaterial map={walnut.map} roughness={0.44} />
                        </mesh>
                        <mesh position={[0, 0, 0.023]}>
                            <planeGeometry args={[0.76, 0.98]} />
                            <meshStandardMaterial
                                map={posterTex}
                                roughness={0.72}
                                emissive={easelHover || regFocused ? '#FFE1AE' : '#000000'}
                                emissiveIntensity={easelHover || regFocused ? 0.08 : 0}
                            />
                        </mesh>
                    </group>
                </group>
            )}
        </group>
    )
}
