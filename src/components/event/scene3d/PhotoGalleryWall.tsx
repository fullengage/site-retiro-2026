import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { getWalnutTextures } from './materials'
import { PALETTE, type FocusTargetId, type Scene3DPhoto } from './types'

const COMMUNITY_FALLBACK_PHOTOS: Scene3DPhoto[] = [
    { url: '/images/tendadoração2025.jpg', label: 'Oração em comunidade' },
    { url: '/images/ensaiohoje.jpeg', label: 'Partilha e acolhimento' },
    { url: '/images/ensaiohoje2.jpeg', label: 'Música e comunhão na sala' },
    { url: '/images/bastidores_2025.png', label: 'Serviço e bastidores' },
    { url: '/images/quadro-retiro.webp', label: 'Retiro em unidade' },
]

export const PHOTO_SLOTS: {
    position: [number, number, number]
    rotation: [number, number, number]
    size: [number, number]
    camOffset: [number, number, number]
}[] = [
    // Parede esquerda (proximo a entrada, apos a janela — luz lateral quente)
    {
        position: [-5.94, 2.95, -2.95],
        rotation: [0, Math.PI / 2, 0],
        size: [1.18, 1.48],
        camOffset: [2.25, 0.0, 0.0],
    },
    {
        position: [-5.94, 3.05, -1.35],
        rotation: [0, Math.PI / 2, 0],
        size: [1.28, 0.98],
        camOffset: [2.25, 0.0, 0.0],
    },
    // Parede do fundo, direita do nicho santuario
    {
        position: [2.85, 3.15, -9.93],
        rotation: [0, 0, 0],
        size: [1.32, 1.02],
        camOffset: [0.0, 0.0, 2.3],
    },
    {
        position: [4.55, 2.95, -9.93],
        rotation: [0, 0, 0],
        size: [1.08, 1.38],
        camOffset: [0.0, 0.0, 2.3],
    },
]

function FramedCommunityPhoto({
    photo,
    position,
    rotation,
    size,
    selected,
    onClick,
}: {
    photo: Scene3DPhoto
    position: [number, number, number]
    rotation: [number, number, number]
    size: [number, number]
    selected: boolean
    onClick: () => void
}) {
    const walnut = useMemo(() => getWalnutTextures(), [])
    const [tex, setTex] = useState<THREE.Texture | null>(null)
    const [hovered, setHovered] = useState(false)

    useEffect(() => {
        if (!photo?.url) return
        let cancelled = false
        const loader = new THREE.TextureLoader()
        loader.setCrossOrigin('anonymous')
        loader.load(
            encodeURI(photo.url),
            loaded => {
                if (cancelled) {
                    loaded.dispose()
                    return
                }
                loaded.colorSpace = THREE.SRGBColorSpace
                loaded.anisotropy = 4
                setTex(loaded)
            },
            undefined,
            () => {
                if (!cancelled) setTex(null)
            }
        )
        return () => {
            cancelled = true
        }
    }, [photo?.url])

    const highlighted = hovered || selected

    return (
        <group
            position={position}
            rotation={rotation}
            scale={highlighted ? 1.04 : 1}
            onClick={e => {
                e.stopPropagation()
                onClick()
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
            {/* Moldura externa em madeira nogueira */}
            <mesh castShadow>
                <boxGeometry args={[size[0] + 0.24, size[1] + 0.28, 0.06]} />
                <meshStandardMaterial map={walnut.map} roughness={0.44} />
            </mesh>
            {/* Passe-partout creme */}
            <mesh position={[0, 0, 0.028]}>
                <boxGeometry args={[size[0] + 0.12, size[1] + 0.16, 0.015]} />
                <meshStandardMaterial color={PALETTE.cream} roughness={0.82} />
            </mesh>
            {/* Fotografia real */}
            <mesh position={[0, 0.01, 0.038]}>
                <planeGeometry args={size} />
                <meshStandardMaterial
                    key={tex?.uuid ?? 'loading'}
                    map={tex}
                    color={tex ? '#FFFFFF' : '#C9B19C'}
                    roughness={0.48}
                    emissive={highlighted ? '#FFE1AE' : '#000000'}
                    emissiveIntensity={highlighted ? 0.08 : 0}
                />
            </mesh>
            {/* Vidro protetor sutil */}
            <mesh position={[0, 0.01, 0.043]}>
                <planeGeometry args={size} />
                <meshStandardMaterial
                    color="#FFF9F0"
                    transparent
                    opacity={0.07}
                    roughness={0.08}
                    metalness={0.2}
                />
            </mesh>
            {/* Pequena luminaria de quadro em latao */}
            <mesh position={[0, size[1] / 2 + 0.21, 0.1]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.018, 0.018, 0.42, 10]} />
                <meshStandardMaterial color={PALETTE.brass} metalness={0.85} roughness={0.25} />
            </mesh>
        </group>
    )
}

export function getResolvedPhotos(photos: Scene3DPhoto[]): Scene3DPhoto[] {
    const valid = photos.filter(p => Boolean(p?.url))
    const merged: Scene3DPhoto[] = []
    for (let i = 0; i < PHOTO_SLOTS.length; i++) {
        merged.push(valid[i] || COMMUNITY_FALLBACK_PHOTOS[i % COMMUNITY_FALLBACK_PHOTOS.length])
    }
    return merged
}

export function PhotoGalleryWall({
    photos,
    focusedTarget,
    focusedPhotoIndex,
    onSelectPhoto,
}: {
    photos: Scene3DPhoto[]
    focusedTarget: FocusTargetId
    focusedPhotoIndex: number | null
    onSelectPhoto: (index: number) => void
}) {
    const resolved = useMemo(() => getResolvedPhotos(photos), [photos])

    return (
        <group>
            {PHOTO_SLOTS.map((slot, idx) => (
                <FramedCommunityPhoto
                    key={`${resolved[idx].url}-${idx}`}
                    photo={resolved[idx]}
                    position={slot.position}
                    rotation={slot.rotation}
                    size={slot.size}
                    selected={focusedTarget === 'fotos' && focusedPhotoIndex === idx}
                    onClick={() => onSelectPhoto(idx)}
                />
            ))}
        </group>
    )
}
