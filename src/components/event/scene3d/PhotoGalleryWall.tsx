import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { getWalnutTextures } from './materials'
import { PALETTE, type FocusTargetId, type Scene3DPhoto } from './types'

const COMMUNITY_FALLBACK_PHOTOS: Scene3DPhoto[] = [
    { url: '/images/tendadoração2025.jpg', label: 'Oração em comunidade' },
    { url: '/images/ensaiohoje.jpeg', label: 'Partilha e acolhimento' },
    { url: '/images/ensaiohoje2.jpeg', label: 'Música e comunhão na sala' },
    { url: '/images/comunidade-matriz.jpg', label: 'Comunidade Voz de Deus na Matriz' },
]

export const PHOTO_SLOTS: {
    position: [number, number, number]
    rotation: [number, number, number]
    size: [number, number]
    camOffset: [number, number, number]
}[] = [
    // Parede esquerda (proximo a entrada, apos a janela — luz lateral quente)
    {
        position: [-5.94, 2.95, -3.28],
        rotation: [0, Math.PI / 2, 0],
        size: [1.06, 1.36],
        camOffset: [2.25, 0.0, 0.0],
    },
    {
        position: [-5.94, 3.05, -1.78],
        rotation: [0, Math.PI / 2, 0],
        size: [1.14, 0.9],
        camOffset: [2.25, 0.0, 0.0],
    },
    {
        position: [-5.94, 2.9, -0.45],
        rotation: [0, Math.PI / 2, 0],
        size: [0.9, 1.18],
        camOffset: [2.25, 0.0, 0.0],
    },
    // Parede do fundo, extremidade direita (ao lado do logo da Comunidade — proporcao 4:3)
    {
        position: [4.42, 3.08, -9.93],
        rotation: [0, 0, 0],
        size: [1.62, 1.22],
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
    return [
        valid[0] || COMMUNITY_FALLBACK_PHOTOS[0],
        valid[1] || COMMUNITY_FALLBACK_PHOTOS[1],
        valid[2] || COMMUNITY_FALLBACK_PHOTOS[2],
        // Quadro em destaque na parede do fundo ao lado do logo: foto oficial da comunidade na Matriz
        COMMUNITY_FALLBACK_PHOTOS[3],
    ]
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
