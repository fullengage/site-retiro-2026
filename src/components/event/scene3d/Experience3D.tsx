import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Float, Sparkles, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { MotionValue } from 'framer-motion'

// Cena WebGL da home do evento — etapa (a): entrada + porta que abre com a rolagem.
// ponytail: tudo em geometria simples (placeholders); modelos .glb entram depois sem mudar câmera/scroll.

const C = { d900: '#2B1B14', d700: '#5A3B2E', d500: '#8B6A55', d300: '#C9B19C', d100: '#F3E7D6' }

export type Scene3DLabel = { id: string; label: string }
type Props = {
    progress: MotionValue<number>
    labels: Scene3DLabel[]
    photos: { url: string }[]
    onOpen: (id: string) => void
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const range = (v: number, a: number, b: number) => clamp01((v - a) / (b - a))
const smooth = (t: number) => t * t * (3 - 2 * t)

// Arco da porta: largura 2.4, retângulo até 2.6 + meia-lua de raio 1.2
const ARCH_W = 2.4
const ARCH_RECT = 2.6

const Facade = () => {
    const geo = useMemo(() => {
        const s = new THREE.Shape()
        s.moveTo(-8, 0)
        s.lineTo(8, 0)
        s.lineTo(8, 7)
        s.lineTo(-8, 7)
        s.lineTo(-8, 0)
        const hole = new THREE.Path()
        hole.moveTo(-ARCH_W / 2, 0)
        hole.lineTo(-ARCH_W / 2, ARCH_RECT)
        hole.absarc(0, ARCH_RECT, ARCH_W / 2, Math.PI, 0, true)
        hole.lineTo(ARCH_W / 2, 0)
        hole.lineTo(-ARCH_W / 2, 0)
        s.holes.push(hole)
        return new THREE.ExtrudeGeometry(s, { depth: 0.4, bevelEnabled: false })
    }, [])
    const frame = useMemo(() => {
        const arch = (w: number) => {
            const p = new THREE.Path()
            p.moveTo(-w / 2, 0)
            p.lineTo(-w / 2, ARCH_RECT)
            p.absarc(0, ARCH_RECT, w / 2, Math.PI, 0, true)
            p.lineTo(w / 2, 0)
            p.lineTo(-w / 2, 0)
            return p
        }
        const outer = new THREE.Shape(arch(ARCH_W + 0.3).getPoints(64))
        outer.holes.push(arch(ARCH_W))
        return new THREE.ExtrudeGeometry(outer, { depth: 0.12, bevelEnabled: false })
    }, [])
    return (
        <group>
            <mesh geometry={geo} position={[0, 0, -0.2]} castShadow receiveShadow>
                <meshStandardMaterial color={C.d300} roughness={0.95} />
            </mesh>
            <mesh geometry={frame} position={[0, 0, 0.2]}>
                <meshStandardMaterial color={C.d100} roughness={0.6} />
            </mesh>
        </group>
    )
}

// Folhas da porta (dobradiças nas laterais do arco)
const Door = ({ open }: { open: { current: number } }) => {
    const left = useRef<THREE.Group>(null)
    const right = useRef<THREE.Group>(null)
    useFrame((_, dt) => {
        const target = smooth(open.current) * THREE.MathUtils.degToRad(105)
        if (left.current) left.current.rotation.y = THREE.MathUtils.damp(left.current.rotation.y, -target, 6, dt)
        if (right.current) right.current.rotation.y = THREE.MathUtils.damp(right.current.rotation.y, target, 6, dt)
    })
    const leaf = (side: 1 | -1) => (
        <mesh position={[side * ARCH_W / 4, ARCH_RECT / 2, 0]} castShadow>
            <boxGeometry args={[ARCH_W / 2 - 0.02, ARCH_RECT - 0.02, 0.08]} />
            <meshStandardMaterial color={C.d700} roughness={0.7} />
        </mesh>
    )
    return (
        <>
            <group ref={left} position={[-ARCH_W / 2, 0, 0.1]}>{leaf(1)}</group>
            <group ref={right} position={[ARCH_W / 2, 0, 0.1]}>{leaf(-1)}</group>
            {/* Bandeira em meia-lua com sol (vidro creme) */}
            <mesh position={[0, ARCH_RECT, 0.1]}>
                <circleGeometry args={[ARCH_W / 2 - 0.03, 48, 0, Math.PI]} />
                <meshStandardMaterial color={C.d100} emissive={'#F7D9A8'} emissiveIntensity={0.9} />
            </mesh>
        </>
    )
}

// Piso de azulejos (textura gerada em canvas)
const useTiles = () =>
    useMemo(() => {
        const cv = document.createElement('canvas')
        cv.width = cv.height = 256
        const g = cv.getContext('2d')!
        const n = 4, s = 256 / n
        for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
            g.fillStyle = (x + y) % 2 ? C.d300 : C.d100
            g.fillRect(x * s, y * s, s, s)
            g.strokeStyle = C.d500
            g.lineWidth = 3
            g.beginPath()
            g.arc(x * s + s / 2, y * s + s / 2, s / 3.2, 0, Math.PI * 2)
            g.stroke()
        }
        const t = new THREE.CanvasTexture(cv)
        t.wrapS = t.wrapT = THREE.RepeatWrapping
        t.repeat.set(8, 5)
        t.colorSpace = THREE.SRGBColorSpace
        return t
    }, [])

const Pot = ({ x }: { x: number }) => (
    <group position={[x, 0, 1.1]}>
        <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.32, 0.24, 0.7, 24]} />
            <meshStandardMaterial color={C.d700} roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.0, 0]} castShadow>
            <icosahedronGeometry args={[0.5, 1]} />
            <meshStandardMaterial color={'#6F7A4E'} roughness={1} flatShading />
        </mesh>
    </group>
)

// Foto da galeria como quadro (carrega sem travar a cena se der erro)
const PhotoFrame = ({ url, position, rotation, size = [1.1, 1.4] }: { url?: string; position: [number, number, number]; rotation?: [number, number, number]; size?: [number, number] }) => {
    const [tex, setTex] = useState<THREE.Texture | null>(null)
    useEffect(() => {
        if (!url) return
        const loader = new THREE.TextureLoader()
        loader.setCrossOrigin('anonymous')
        loader.load(url, t => { t.colorSpace = THREE.SRGBColorSpace; setTex(t) }, undefined, () => setTex(null))
    }, [url])
    if (!url) return null
    return (
        <group position={position} rotation={rotation}>
            <mesh castShadow>
                <boxGeometry args={[size[0] + 0.16, size[1] + 0.28, 0.05]} />
                <meshStandardMaterial color={C.d100} />
            </mesh>
            <mesh position={[0, 0.06, 0.03]}>
                <planeGeometry args={size} />
                <meshStandardMaterial key={tex?.uuid ?? 'sem-foto'} map={tex} color={tex ? '#fff' : C.d500} />
            </mesh>
        </group>
    )
}

// Rótulo 3D curvo e clicável (navegação)
const Label3D = ({ text, position, rotation, onClick, color = C.d100, size = 0.42, curved = true }: {
    text: string; position: [number, number, number]; rotation?: [number, number, number]; onClick: () => void; color?: string; size?: number; curved?: boolean
}) => {
    const ref = useRef<THREE.Group>(null)
    const [hover, setHover] = useState(false)
    useFrame((_, dt) => {
        if (!ref.current) return
        const s = THREE.MathUtils.damp(ref.current.scale.x, hover ? 1.06 : 1, 8, dt)
        ref.current.scale.setScalar(s)
    })
    useEffect(() => { document.body.style.cursor = hover ? 'pointer' : '' }, [hover])
    return (
        <group ref={ref} position={position} rotation={rotation}>
            <Text
                fontSize={size}
                letterSpacing={0.12}
                color={color}
                // curveRadius é do troika-three-text; falta nos tipos do drei 9
                {...(curved ? ({ curveRadius: -3.2 } as object) : {})}
                anchorX="center"
                anchorY="middle"
                onClick={e => { e.stopPropagation(); onClick() }}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                {text.toUpperCase()}
            </Text>
            <Text position={[0, -0.45, 0]} fontSize={0.3} color={color}>+</Text>
        </group>
    )
}

// Vitrola: vinil girando
const RecordPlayer = ({ onClick }: { onClick: () => void }) => {
    const disc = useRef<THREE.Mesh>(null)
    useFrame((_, dt) => { if (disc.current) disc.current.rotation.y += dt * 2 })
    return (
        <group position={[3.4, 0, -6.6]} onClick={e => { e.stopPropagation(); onClick() }}>
            <mesh position={[0, 0.45, 0]} castShadow>
                <boxGeometry args={[1.6, 0.9, 1]} />
                <meshStandardMaterial color={C.d700} roughness={0.7} />
            </mesh>
            <mesh ref={disc} position={[-0.15, 0.93, 0]}>
                <cylinderGeometry args={[0.38, 0.38, 0.03, 48]} />
                <meshStandardMaterial color={'#1a110c'} roughness={0.3} metalness={0.2} />
            </mesh>
            <mesh position={[-0.15, 0.95, 0]}>
                <cylinderGeometry args={[0.12, 0.12, 0.031, 32]} />
                <meshStandardMaterial color={C.d300} />
            </mesh>
        </group>
    )
}

// Sala (placeholder geométrico): piso, duas paredes, móveis simples, luminária
const Room = ({ labels, photos, onOpen }: Omit<Props, 'progress'>) => {
    const lamp = useRef<THREE.Group>(null)
    useFrame(({ clock }) => {
        if (lamp.current) lamp.current.rotation.z = Math.sin(clock.elapsedTime * 1.2) * THREE.MathUtils.degToRad(2)
    })
    const has = (id: string) => labels.find(l => l.id === id)
    const open = (id: string) => () => onOpen(id)
    return (
        <group>
            {/* piso */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -5]} receiveShadow>
                <planeGeometry args={[12, 10]} />
                <meshStandardMaterial color={C.d300} roughness={0.9} />
            </mesh>
            {/* parede do fundo e esquerda */}
            <mesh position={[0, 3.5, -10]} receiveShadow>
                <planeGeometry args={[12, 7]} />
                <meshStandardMaterial color={C.d500} roughness={1} />
            </mesh>
            <mesh position={[-6, 3.5, -5]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
                <planeGeometry args={[10, 7]} />
                <meshStandardMaterial color={C.d700} roughness={1} />
            </mesh>
            <mesh position={[6, 3.5, -5]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
                <planeGeometry args={[10, 7]} />
                <meshStandardMaterial color={C.d500} roughness={1} />
            </mesh>

            {/* fotos na parede da esquerda + rótulo */}
            <PhotoFrame url={photos[0]?.url} position={[-5.95, 2.6, -7.5]} rotation={[0, Math.PI / 2, 0.04]} />
            <PhotoFrame url={photos[1]?.url} position={[-5.95, 2.9, -5.6]} rotation={[0, Math.PI / 2, -0.03]} size={[1.4, 1]} />
            <PhotoFrame url={photos[2]?.url} position={[-5.95, 2.5, -3.6]} rotation={[0, Math.PI / 2, 0.02]} />
            {has('fotos') && <Label3D text="Fotos" position={[-5.8, 4.6, -5.6]} rotation={[0, Math.PI / 2, 0]} onClick={open('fotos')} />}

            {/* parede do fundo: programação + cruz + quadro */}
            {has('informacoes') && <Label3D text="Programação" position={[-1.2, 4.9, -9.9]} onClick={open('informacoes')} />}
            <group position={[1.8, 3.3, -9.95]}>
                <mesh><boxGeometry args={[0.12, 1.4, 0.06]} /><meshStandardMaterial color={C.d100} /></mesh>
                <mesh position={[0, 0.25, 0]}><boxGeometry args={[0.8, 0.12, 0.06]} /><meshStandardMaterial color={C.d100} /></mesh>
            </group>
            <PhotoFrame url={photos[3]?.url} position={[-2.4, 2.4, -9.95]} size={[1.3, 1]} />

            {/* mesa redonda + poltrona */}
            <group position={[-1.2, 0, -5.2]}>
                <mesh position={[0, 0.75, 0]} castShadow><cylinderGeometry args={[0.8, 0.8, 0.06, 40]} /><meshStandardMaterial color={C.d100} /></mesh>
                <mesh position={[0, 0.37, 0]} castShadow><cylinderGeometry args={[0.07, 0.25, 0.74, 16]} /><meshStandardMaterial color={C.d100} /></mesh>
            </group>
            <group position={[1.6, 0, -4.4]} rotation={[0, -0.5, 0]}>
                <mesh position={[0, 0.35, 0]} castShadow><boxGeometry args={[1.4, 0.5, 1.1]} /><meshStandardMaterial color={'#6E7F6A'} roughness={1} /></mesh>
                <mesh position={[0, 0.85, -0.45]} castShadow><boxGeometry args={[1.4, 0.9, 0.2]} /><meshStandardMaterial color={'#6E7F6A'} roughness={1} /></mesh>
            </group>

            {/* tapete kids + rótulos deitados no chão */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3.4, 0.01, -2.6]}>
                <circleGeometry args={[1.4, 48]} />
                <meshStandardMaterial color={C.d100} />
            </mesh>
            {has('criancas') && <Label3D text="Crianças" position={[-3.4, 0.03, -2.6]} rotation={[-Math.PI / 2, 0, 0]} onClick={open('criancas')} color={C.d700} size={0.32} curved={false} />}
            {has('inscricao') && <Label3D text="Inscrição" position={[1.2, 0.03, -3.0]} rotation={[-Math.PI / 2, 0, 0]} onClick={open('inscricao')} color={C.d900} curved={false} />}

            {has('musicas') && <RecordPlayer onClick={open('musicas')} />}

            {/* luminária pendurada */}
            <group ref={lamp} position={[0, 7, -5.2]}>
                <mesh position={[0, -1.5, 0]}><cylinderGeometry args={[0.01, 0.01, 3, 6]} /><meshBasicMaterial color={C.d900} /></mesh>
                <mesh position={[0, -3.2, 0]}>
                    <sphereGeometry args={[0.55, 32, 16]} />
                    <meshStandardMaterial color={'#C98A55'} emissive={'#F2B672'} emissiveIntensity={0.8} />
                </mesh>
            </group>

            <Sparkles count={40} scale={[11, 5, 9]} position={[0, 3, -5]} size={2} speed={0.2} color={C.d100} />
            <ContactShadows position={[0, 0.005, -5]} scale={12} blur={2.4} opacity={0.45} far={4} />
        </group>
    )
}

// Câmera: entrada -> passa pelo arco -> vista geral da sala; parallax do mouse
const CameraRig = ({ progress, open }: { progress: MotionValue<number>; open: { current: number } }) => {
    const { camera, pointer } = useThree()
    const pos = useMemo(() => new THREE.Vector3(), [])
    const look = useMemo(() => new THREE.Vector3(), [])
    const curLook = useRef(new THREE.Vector3(0, 1.6, 0))
    const P0 = useMemo(() => [new THREE.Vector3(0, 1.8, 9), new THREE.Vector3(0, 1.7, 0)], [])
    const P1 = useMemo(() => [new THREE.Vector3(0, 1.6, 0.6), new THREE.Vector3(0, 1.6, -6)], [])
    const P2 = useMemo(() => [new THREE.Vector3(3.8, 5.6, -2.0), new THREE.Vector3(-2.0, 1.2, -7.4)], [])

    useFrame((_, dt) => {
        const p = progress.get()
        open.current = range(p, 0, 0.4)
        const d = smooth(range(p, 0.2, 1))
        // duas pernas: até a porta (0→0.6) e da porta à vista geral (0.6→1)
        if (d < 0.6) {
            const t = smooth(d / 0.6)
            pos.lerpVectors(P0[0], P1[0], t)
            look.lerpVectors(P0[1], P1[1], t)
        } else {
            const t = smooth((d - 0.6) / 0.4)
            pos.lerpVectors(P1[0], P2[0], t)
            look.lerpVectors(P1[1], P2[1], t)
        }
        const cam = camera as THREE.PerspectiveCamera
        const fov = 35 + 15 * smooth(range(d, 0.6, 1))
        if (Math.abs(cam.fov - fov) > 0.01) {
            cam.fov = fov
            cam.updateProjectionMatrix()
        }
        pos.x += pointer.x * 0.15
        pos.y += pointer.y * 0.15
        camera.position.lerp(pos, 1 - Math.pow(0.0001, dt))
        curLook.current.lerp(look, 1 - Math.pow(0.0001, dt))
        camera.lookAt(curLook.current)
    })
    return null
}

const Experience3D = ({ progress, labels, photos, onOpen }: Props) => {
    const open = useRef(0)
    const tiles = useTiles()
    return (
        <Canvas
            className="!absolute inset-0"
            aria-hidden="true"
            dpr={[1, 1.75]}
            shadows
            camera={{ fov: 35, position: [0, 1.8, 9], near: 0.1, far: 80 }}
            gl={{ antialias: true }}
        >
            <color attach="background" args={[C.d100]} />
            <fog attach="fog" args={[C.d100, 14, 30]} />
            <ambientLight intensity={0.55} />
            <hemisphereLight args={[C.d100, C.d500, 0.6]} />
            <directionalLight position={[4, 8, 6]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} />
            <spotLight position={[0, 6.5, -5]} angle={0.7} penumbra={0.8} intensity={30} color={'#FFD9A8'} castShadow />

            <CameraRig progress={progress} open={open} />

            {/* área externa */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 5]} receiveShadow>
                <planeGeometry args={[16, 10]} />
                <meshStandardMaterial map={tiles} roughness={0.8} />
            </mesh>
            <Facade />
            <Door open={open} />
            <Pot x={-2.3} />
            <Pot x={2.3} />
            <Float speed={1.2} floatIntensity={0.3} rotationIntensity={0.2}>
                <mesh position={[0, 5.6, 0.35]}>
                    <torusGeometry args={[0.35, 0.05, 12, 32]} />
                    <meshStandardMaterial color={C.d100} emissive={'#F7D9A8'} emissiveIntensity={0.5} />
                </mesh>
            </Float>

            <Room labels={labels} photos={photos} onOpen={onOpen} />
        </Canvas>
    )
}

export default Experience3D
