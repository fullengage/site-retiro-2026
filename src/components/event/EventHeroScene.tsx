import {
    lazy,
    Suspense,
    useCallback,
    useEffect,
    useRef,
    useState,
    type PointerEvent as ReactPointerEvent,
    type ReactNode,
} from 'react'
import { Link } from 'react-router-dom'
import {
    motion,
    AnimatePresence,
    useMotionValue,
    useScroll,
    useSpring,
    useTransform,
} from 'framer-motion'
import { ArrowRight, Eye, Music2, Pause, Play, RotateCcw, Sparkles, X } from 'lucide-react'
import { PlaylistPlayer } from './PlaylistPlayer'
import { RoomFallback } from './RoomFallback'
import { useAdaptiveQuality } from './scene3d/useAdaptiveQuality'
import type { FocusTargetId, QualityTier, TouchLookState } from './scene3d/types'

const Experience3D = lazy(() => import('./scene3d/Experience3D'))

export type ScenePanel = {
    id: string
    label: string
    title: ReactNode
    subtitle?: string
    content: ReactNode
}
export type ScenePhoto = { url: string; label?: string | null }

// Janela em arco com o sol nascendo; usada no fallback/carregamento progressivo
export const ArchWindow = ({ image, alt }: { image?: string; alt: string }) => (
    <svg viewBox="0 0 200 260" className="w-full h-full" role="img" aria-label={alt}>
        <defs>
            <clipPath id="arch">
                <path d="M10 260 V100 A90 90 0 0 1 190 100 V260 Z" />
            </clipPath>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2B1B14" />
                <stop offset=".55" stopColor="#8B6A55" />
                <stop offset="1" stopColor="#F3E7D6" />
            </linearGradient>
        </defs>
        <g clipPath="url(#arch)">
            {image ? (
                <image href={image} x="0" y="0" width="200" height="260" preserveAspectRatio="xMidYMid slice" />
            ) : (
                <>
                    <rect width="200" height="260" fill="url(#sky)" />
                    <g className="dna-sun">
                        <circle cx="100" cy="190" r="34" fill="#F3E7D6" />
                        {Array.from({ length: 12 }, (_, i) => (
                            <line
                                key={i}
                                x1="100"
                                y1="140"
                                x2="100"
                                y2="126"
                                stroke="#F3E7D6"
                                strokeWidth="3"
                                strokeLinecap="round"
                                transform={`rotate(${i * 30 - 165} 100 190)`}
                            />
                        ))}
                    </g>
                    <path d="M0 210 Q50 185 100 205 T200 200 V260 H0 Z" fill="#5A3B2E" />
                    <path d="M0 232 Q60 215 120 230 T200 228 V260 H0 Z" fill="#2B1B14" />
                </>
            )}
        </g>
        <path d="M10 260 V100 A90 90 0 0 1 190 100 V260" fill="none" stroke="#5A3B2E" strokeOpacity=".35" />
        <path d="M2 260 V100 A98 98 0 0 1 198 100 V260" fill="none" stroke="#5A3B2E" strokeOpacity=".15" />
    </svg>
)

// Selo redondo girando com o CTA de inscricao (acessivel desde o 1º paint)
export const SpinBadge = ({ to, label }: { to: string; label: string }) => (
    <Link
        to={to}
        data-testid="hero-register-badge"
        aria-label={label}
        className="group relative block w-32 h-32 md:w-36 md:h-36"
    >
        <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full animate-[spin_14s_linear_infinite] motion-reduce:animate-none"
            aria-hidden="true"
        >
            <defs>
                <path id="badge-circle" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
            </defs>
            <circle cx="50" cy="50" r="49" fill="#2B1B14" />
            <text fill="#F3E7D6" fontSize="7.4" fontWeight="700">
                <textPath href="#badge-circle" textLength="236" lengthAdjust="spacing">
                    {`${label.toUpperCase()} • ${label.toUpperCase()} • `}
                </textPath>
            </text>
        </svg>
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-cafe-100 text-cafe-900 flex items-center justify-center transition-transform group-hover:scale-110">
            <ArrowRight size={20} />
        </span>
    </Link>
)

// Painel lateral de detalhes
const Panel = ({
    panels,
    openId,
    onOpen,
    onClose,
}: {
    panels: ScenePanel[]
    openId: string
    onOpen: (id: string) => void
    onClose: () => void
}) => {
    const panel = panels.find(p => p.id === openId)
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
        window.addEventListener('keydown', onKey)
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            window.removeEventListener('keydown', onKey)
            document.body.style.overflow = prev
        }
    }, [onClose])
    if (!panel) return null

    return (
        <motion.div className="fixed inset-0 z-[60] flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button
                type="button"
                aria-label="Fechar"
                onClick={onClose}
                className="hidden md:block flex-1 bg-cafe-900/40 backdrop-blur-[2px] cursor-default"
            />
            <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={panel.label}
                className="relative w-full md:w-[min(1100px,82vw)] h-full bg-cafe-900 text-cafe-100 flex overflow-hidden"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 120, damping: 22 }}
            >
                <nav className="hidden md:flex flex-col gap-1 m-6 mr-0 p-2 w-14 rounded-2xl border border-cafe-100/15 overflow-y-auto [scrollbar-width:none]">
                    {panels.map(p => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => onOpen(p.id)}
                            className={`flex flex-col items-center gap-2 py-3 rounded-xl text-[10px] tracking-[0.25em] uppercase transition-colors ${
                                p.id === openId ? 'bg-cafe-100 text-cafe-900' : 'text-cafe-300 hover:text-cafe-100'
                            }`}
                        >
                            <span className="[writing-mode:vertical-rl] rotate-180">{p.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="flex-1 overflow-y-auto px-6 md:px-12 pt-20 md:pt-14 pb-16">
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar"
                        className="absolute top-5 right-5 w-11 h-11 rounded-full border border-cafe-100/25 flex items-center justify-center hover:bg-cafe-100 hover:text-cafe-900 transition-colors"
                    >
                        <X size={18} />
                    </button>

                    <div className="md:hidden flex gap-2 overflow-x-auto pb-4 -mx-1 px-1">
                        {panels.map(p => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => onOpen(p.id)}
                                className={`shrink-0 px-4 py-2 rounded-full text-xs uppercase tracking-widest ${
                                    p.id === openId
                                        ? 'bg-cafe-100 text-cafe-900'
                                        : 'border border-cafe-100/20 text-cafe-300'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={panel.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.35 }}
                        >
                            <h2 className="font-display text-4xl md:text-6xl font-light text-cafe-100">{panel.title}</h2>
                            {panel.subtitle && <p className="font-news italic text-xl text-cafe-300 mt-2">{panel.subtitle}</p>}
                            <div className="h-px bg-cafe-100/15 my-8" />
                            {panel.content}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    )
}

type Props = {
    titleMain: string
    titleYear: string
    tagline?: ReactNode
    datesText?: string
    minAge?: number
    description?: string
    location?: string | null
    days: number | null
    image?: string
    eventName: string
    registerUrl?: string
    badgeLabel: string
    panels: ScenePanel[]
    photos: ScenePhoto[]
    info: string[]
    hasPlaylist: boolean
    playlistEmbeds?: string[]
    delay: number
}

const COMMUNITY_EMBEDS = [
    'https://open.spotify.com/embed/album/59DDsSybNWUZ8nGBGXrqsj?theme=0',
    'https://open.spotify.com/embed/artist/5S9z6eKVsdf3fZbTIRpbxI?theme=0',
]

const FOCUS_TITLES: Record<FocusTargetId, string> = {
    overview: 'A Casa que Acolhe — Visão geral',
    informacoes: 'Quadro de Programação',
    fotos: 'Galeria da Comunidade',
    musicas: 'Vitrola — Tribus da Cruz',
    criancas: 'Espaço das Famílias e Crianças',
    inscricao: 'Convite de Inscrição',
}

export const EventHeroScene = (p: Props) => {
    const ref = useRef<HTMLDivElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)

    const { checked, webglSupported, initialQuality, isMobile, prefersReducedMotion } =
        useAdaptiveQuality()

    const [openId, setOpenId] = useState<string | null>(null)
    const [musicDrawerOpen, setMusicDrawerOpen] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [focusedTarget, setFocusedTarget] = useState<FocusTargetId>('overview')
    const [focusedPhotoIndex, setFocusedPhotoIndex] = useState<number | null>(null)
    const [sceneReady, setSceneReady] = useState(false)
    const [contextLost, setContextLost] = useState(false)
    const [forceStatic, setForceStatic] = useState(false)
    const [qualityOverride, setQualityOverride] = useState<QualityTier | null>(null)
    const [roomEntered, setRoomEntered] = useState(false)

    // Estado de toque mobile (arrasto leve sem bloquear rolagem vertical)
    const touchLookRef = useRef<TouchLookState>({ yaw: 0, pitch: 0, zoomOffset: 0 })
    const dragStartRef = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null)
    const lastTapRef = useRef(0)

    const quality: QualityTier = qualityOverride ?? initialQuality
    const canRender3D = checked && webglSupported && !contextLost && !forceStatic

    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

    useEffect(() => {
        if (prefersReducedMotion) {
            setRoomEntered(true)
            return
        }
        return scrollYProgress.on('change', v => {
            setRoomEntered(v >= 0.42)
        })
    }, [scrollYProgress, prefersReducedMotion])

    // Mouse para o fallback 2D CSS
    const mxRaw = useMotionValue(0)
    const myRaw = useMotionValue(0)
    const mx = useSpring(mxRaw, { stiffness: 60, damping: 15 })
    const my = useSpring(myRaw, { stiffness: 60, damping: 15 })

    const archScale = useTransform(scrollYProgress, [0, 0.38], [1, 7.5])
    const archRotY = useTransform(mx, m => m * 10)
    const archRotX = useTransform(my, m => -m * 7)
    const fadeOut = useTransform(scrollYProgress, canRender3D ? [0, 0.48] : [0, 0.2], [1, 0])
    const overlayEvents = useTransform(scrollYProgress, v => (v > 0.44 ? 'none' : 'auto'))
    const titleY = useTransform(scrollYProgress, [0, 0.25], [0, -140])
    const titleSpread = useTransform(scrollYProgress, [0, 0.25], ['-0.01em', '0.2em'])
    const roomHudOpacity = useTransform(scrollYProgress, [0.48, 0.62], [0, 1])

    const handleDegradeQuality = useCallback(() => {
        setQualityOverride(prev => {
            const cur = prev ?? initialQuality
            if (cur === 'high') return 'medium'
            if (cur === 'medium') return 'low'
            return 'low'
        })
    }, [initialQuality])

    const handleReady = useCallback(() => {
        setSceneReady(true)
    }, [])

    const handleContextLost = useCallback(() => {
        setContextLost(true)
    }, [])

    // Controle explicito da musica na vitrola (NUNCA autoplay)
    const handleTogglePlay = useCallback(() => {
        const audio = audioRef.current
        if (!audio) return
        if (audio.paused) {
            audio
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false))
        } else {
            audio.pause()
            setIsPlaying(false)
        }
    }, [])

    const handleOpenMusicDrawer = useCallback((open: boolean) => {
        if (open && audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause()
            setIsPlaying(false)
        }
        setMusicDrawerOpen(open)
    }, [])

    const handleFocusTarget = useCallback(
        (target: FocusTargetId, shouldOpenPanel = false) => {
            setFocusedTarget(target)
            if (target !== 'fotos') setFocusedPhotoIndex(null)
            if (shouldOpenPanel && target !== 'overview') {
                if (target === 'musicas') handleOpenMusicDrawer(true)
                else setOpenId(target)
            }
        },
        [handleOpenMusicDrawer]
    )

    const handleSelectPhoto = useCallback((index: number) => {
        setFocusedTarget('fotos')
        setFocusedPhotoIndex(index)
    }, [])

    // Esc retorna foco para visao geral da sala
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !openId && !musicDrawerOpen && focusedTarget !== 'overview') {
                setFocusedTarget('overview')
                setFocusedPhotoIndex(null)
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [openId, musicDrawerOpen, focusedTarget])

    // Gestos por toque na sala 3D (mobile)
    const onCanvasPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
        if (!isMobile || !roomEntered) return
        const now = performance.now()
        if (now - lastTapRef.current < 280) {
            touchLookRef.current = { yaw: 0, pitch: 0, zoomOffset: 0 }
            setFocusedTarget('overview')
            setFocusedPhotoIndex(null)
        }
        lastTapRef.current = now
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            yaw: touchLookRef.current.yaw,
            pitch: touchLookRef.current.pitch,
        }
    }

    const onCanvasPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
        if (!isMobile) {
            mxRaw.set((e.clientX / window.innerWidth) * 2 - 1)
            myRaw.set((e.clientY / window.innerHeight) * 2 - 1)
            return
        }
        if (!dragStartRef.current || !roomEntered) return
        const dx = (e.clientX - dragStartRef.current.x) / Math.max(240, window.innerWidth)
        const dy = (e.clientY - dragStartRef.current.y) / Math.max(320, window.innerHeight)
        touchLookRef.current.yaw = Math.max(-0.55, Math.min(0.55, dragStartRef.current.yaw - dx * 1.4))
        touchLookRef.current.pitch = Math.max(-0.35, Math.min(0.35, dragStartRef.current.pitch + dy * 0.9))
    }

    const onCanvasPointerUp = () => {
        dragStartRef.current = null
    }

    const activePanelTargets = p.panels.filter(
        panel => ['informacoes', 'fotos', 'musicas', 'criancas', 'inscricao'].includes(panel.id)
    )

    const playlistEmbeds = p.playlistEmbeds?.length ? p.playlistEmbeds : COMMUNITY_EMBEDS

    return (
        <section
            id="sobre"
            ref={ref}
            className={`relative ${prefersReducedMotion ? 'min-h-screen' : 'h-[300vh]'}`}
            onPointerDown={onCanvasPointerDown}
            onPointerMove={onCanvasPointerMove}
            onPointerUp={onCanvasPointerUp}
            onPointerCancel={onCanvasPointerUp}
        >
            {/* Audio sob demanda da vitrola — sem autoplay */}
            <audio
                ref={audioRef}
                src="/audio/tribus-da-cruz.mp3"
                preload="none"
                loop
                onEnded={() => setIsPlaying(false)}
            />

            <div className="sr-only" aria-live="polite">
                {FOCUS_TITLES[focusedTarget]}
            </div>

            <div
                className="sticky top-0 h-screen overflow-hidden pt-20 md:pt-24 px-5 md:px-12"
                style={{ touchAction: 'pan-y' }}
            >
                {/* Camada 3D WebGL (carregada progressivamente) */}
                {canRender3D && (
                    <Suspense fallback={null}>
                        <Experience3D
                            progress={scrollYProgress}
                            labels={p.panels.map(x => ({ id: x.id, label: x.label }))}
                            photos={p.photos}
                            info={p.info}
                            isPlaying={isPlaying}
                            focusedTarget={focusedTarget}
                            focusedPhotoIndex={focusedPhotoIndex}
                            quality={quality}
                            isMobile={isMobile}
                            prefersReducedMotion={prefersReducedMotion}
                            touchLookRef={touchLookRef}
                            onFocusTarget={handleFocusTarget}
                            onSelectPhoto={handleSelectPhoto}
                            onTogglePlay={handleTogglePlay}
                            onOpenPanel={id => {
                                if (id === 'musicas') handleOpenMusicDrawer(true)
                                else setOpenId(id)
                            }}
                            onReady={handleReady}
                            onContextLost={handleContextLost}
                            onDegradeQuality={handleDegradeQuality}
                        />
                    </Suspense>
                )}

                {/* Versao alternativa para dispositivos sem WebGL, reduced-motion estatico ou Modo 2D */}
                {!canRender3D && (roomEntered || !webglSupported || forceStatic || prefersReducedMotion) && (
                    <div className="absolute inset-0 z-20">
                        <RoomFallback
                            panels={p.panels}
                            photos={p.photos}
                            info={p.info}
                            isPlaying={isPlaying}
                            registerUrl={p.registerUrl}
                            badgeLabel={p.badgeLabel}
                            onOpenPanel={id => {
                                if (id === 'musicas') handleOpenMusicDrawer(true)
                                else setOpenId(id)
                            }}
                            onTogglePlay={handleTogglePlay}
                        />
                    </div>
                )}

                {/* Preview imediato da fachada enquanto WebGL carrega progressivamente */}
                {canRender3D && !sceneReady && !prefersReducedMotion && (
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#EEDEC8] via-[#E1CCB3] to-[#C9B19C] transition-opacity duration-500"
                    >
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-cafe-900/80 px-4 py-1.5 text-[10px] uppercase tracking-[0.22em] text-cafe-100">
                            <Sparkles size={12} className="animate-pulse text-[#FFE1AE]" />
                            Preparando sala 3D
                        </div>
                    </div>
                )}

                {/* Cabeçalho Hero da Entrada (some suavemente ao entrar na sala) */}
                {!prefersReducedMotion && !(!canRender3D && roomEntered) && (
                    <>
                        <motion.div
                            style={{ opacity: fadeOut }}
                            className="relative z-10 flex justify-between items-start text-[11px] tracking-[0.26em] uppercase text-cafe-700 mb-3 pointer-events-none"
                        >
                            <span className="hidden md:inline-flex items-center gap-2.5 bg-cafe-100/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-cafe-700/15">
                                <img
                                    src="/images/logo-comunidade-emblema.png"
                                    alt=""
                                    className="w-4 h-4 rounded-full object-cover"
                                />
                                Comunidade Voz de Deus
                            </span>
                            <span className="md:text-right bg-cafe-100/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-cafe-700/15">
                                {p.days !== null && p.days > 0 && (
                                    <>
                                        <span className="text-cafe-900 font-bold">faltam {p.days} dias</span>
                                        <span className="hidden md:inline"> • </span>
                                    </>
                                )}
                                <span className="hidden md:inline">{p.location}</span>
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, delay: p.delay }}
                            style={{ y: titleY, letterSpacing: titleSpread }}
                            className="relative z-10 font-display font-thin uppercase text-cafe-900 leading-[0.86] text-[15vw] md:text-[9.2vw] pointer-events-none drop-shadow-[0_2px_12px_rgba(243,231,214,0.8)]"
                        >
                            <motion.span style={{ opacity: fadeOut }}>
                                {p.titleMain}
                                {p.titleYear && (
                                    <span className="text-cafe-700 text-[0.45em] align-top ml-3">{p.titleYear}</span>
                                )}
                            </motion.span>
                        </motion.h1>

                        <motion.div
                            style={{ pointerEvents: overlayEvents }}
                            className="relative z-10 grid md:grid-cols-[1fr_auto_1fr] items-end gap-6 mt-4 md:-mt-[1vw]"
                        >
                            <motion.div
                                style={{ opacity: fadeOut }}
                                className="order-2 md:order-1 md:pb-8 space-y-2 max-w-xs bg-cafe-100/80 md:bg-cafe-100/75 backdrop-blur-sm rounded-2xl p-4 border border-cafe-700/10"
                            >
                                <p className="text-[10px] uppercase tracking-[0.28em] text-cafe-500">
                                    A Casa que Acolhe
                                </p>
                                {p.tagline && <p className="font-news text-2xl md:text-3xl text-cafe-900">{p.tagline}</p>}
                                {p.datesText && <p className="text-xs tracking-[0.2em] uppercase text-cafe-700">{p.datesText}</p>}
                                {p.minAge && <p className="text-xs text-cafe-700">Inscrição para maiores de {p.minAge} anos</p>}
                            </motion.div>

                            <div
                                className="order-1 md:order-2 relative mx-auto [perspective:900px]"
                                style={{ width: 'min(58vw, 320px, 42vh)' }}
                            >
                                {canRender3D ? (
                                    <div className="aspect-[200/260]" />
                                ) : (
                                    <motion.div
                                        className="aspect-[200/260] will-change-transform"
                                        style={{
                                            scale: archScale,
                                            rotateY: archRotY,
                                            rotateX: archRotX,
                                            transformOrigin: '50% 73%',
                                        }}
                                    >
                                        <ArchWindow image={p.image} alt={p.eventName} />
                                    </motion.div>
                                )}

                                {p.registerUrl && (
                                    <motion.div
                                        style={{ opacity: fadeOut }}
                                        className="absolute -right-8 md:-right-14 bottom-4 z-20"
                                    >
                                        <SpinBadge to={p.registerUrl} label={p.badgeLabel} />
                                    </motion.div>
                                )}
                            </div>

                            <motion.div
                                style={{ opacity: fadeOut }}
                                className="hidden md:block order-3 md:pb-8 md:text-right"
                            >
                                {p.description && (
                                    <p className="text-cafe-900 text-base leading-relaxed max-w-xs md:ml-auto bg-cafe-100/75 backdrop-blur-sm rounded-2xl p-4 border border-cafe-700/10">
                                        {p.description}
                                    </p>
                                )}
                            </motion.div>
                        </motion.div>
                    </>
                )}

                {/* HUD da Sala 3D (aparece quando o visitante entra pela porta) */}
                {canRender3D && (
                    <motion.div
                        style={{ opacity: prefersReducedMotion ? 1 : roomHudOpacity }}
                        className={`pointer-events-none absolute inset-x-0 top-20 bottom-4 z-20 flex flex-col justify-between px-4 md:px-10 ${
                            roomEntered ? '' : 'invisible'
                        }`}
                    >
                        {/* Topo da sala: Logo + CTA de inscricao sempre acessivel + toggle de modo */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-cafe-100/90 backdrop-blur-md border border-cafe-700/15 px-3.5 py-1.5 shadow-sm">
                                <img
                                    src="/images/logo-comunidade-cafe.webp"
                                    alt="Comunidade Voz de Deus"
                                    className="h-6 sm:h-7 w-auto object-contain"
                                />
                                <span className="hidden sm:inline text-[10px] uppercase tracking-[0.22em] text-cafe-700 border-l border-cafe-700/20 pl-2.5">
                                    A Casa que Acolhe
                                </span>
                            </div>

                            <div className="pointer-events-auto flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setForceStatic(true)}
                                    className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-cafe-100/85 border border-cafe-700/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-cafe-700 hover:bg-cafe-100 transition-colors"
                                    title="Alternar para visualização leve sem 3D"
                                >
                                    <Eye size={12} /> Modo 2D
                                </button>

                                {p.registerUrl && (
                                    <Link
                                        to={p.registerUrl}
                                        data-testid="room-register-cta"
                                        className="inline-flex items-center gap-1.5 rounded-full bg-cafe-900 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-cafe-100 shadow-lg hover:bg-cafe-700 transition-colors"
                                    >
                                        <span>Inscreva-se</span>
                                        <ArrowRight size={13} />
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Cartao contextual quando um objeto esta focado + Barra de navegacao da sala */}
                        <div className="flex flex-col items-center gap-2.5 pb-16 sm:pb-2">
                            {focusedTarget !== 'overview' && (
                                <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-cafe-900/92 text-cafe-100 px-4 py-2.5 shadow-xl backdrop-blur-md border border-cafe-100/15">
                                    <span className="font-news italic text-base sm:text-lg pr-1">
                                        {FOCUS_TITLES[focusedTarget]}
                                    </span>

                                    {focusedTarget === 'musicas' && (
                                        <button
                                            type="button"
                                            onClick={handleTogglePlay}
                                            className="inline-flex items-center gap-1.5 rounded-full bg-cafe-100 text-cafe-900 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-cafe-300 transition-colors"
                                        >
                                            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                                            {isPlaying ? 'Pausar disco' : 'Tocar disco'}
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (focusedTarget === 'musicas') handleOpenMusicDrawer(true)
                                            else setOpenId(focusedTarget)
                                        }}
                                        className="inline-flex items-center gap-1.5 rounded-full bg-[#C89B54] text-cafe-900 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-[#DFB570] transition-colors"
                                    >
                                        Abrir detalhes <ArrowRight size={12} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleFocusTarget('overview')}
                                        className="inline-flex items-center gap-1 rounded-full border border-cafe-100/25 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-cafe-300 hover:text-cafe-100 transition-colors"
                                    >
                                        <RotateCcw size={12} /> Voltar
                                    </button>
                                </div>
                            )}

                            {/* Chips de navegacao acessiveis em desktop e mobile */}
                            <div
                                role="toolbar"
                                aria-label="Explorar objetos da sala"
                                className="pointer-events-auto flex max-w-full items-center gap-1.5 overflow-x-auto rounded-full bg-cafe-100/92 border border-cafe-700/15 px-2 py-1.5 shadow-[0_10px_30px_rgba(43,27,20,0.16)] backdrop-blur-md [scrollbar-width:none]"
                            >
                                <button
                                    type="button"
                                    data-testid="room-nav-overview"
                                    onClick={() => handleFocusTarget('overview')}
                                    className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
                                        focusedTarget === 'overview'
                                            ? 'bg-cafe-900 text-cafe-100'
                                            : 'text-cafe-700 hover:bg-cafe-300/40'
                                    }`}
                                >
                                    Sala
                                </button>
                                {activePanelTargets.map(item => {
                                    const tid = item.id as FocusTargetId
                                    const active = focusedTarget === tid
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            data-testid={`room-nav-${item.id}`}
                                            onClick={() => handleFocusTarget(tid, active)}
                                            className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
                                                active
                                                    ? 'bg-cafe-900 text-cafe-100'
                                                    : 'text-cafe-700 hover:bg-cafe-300/40'
                                            }`}
                                        >
                                            {item.id === 'musicas' ? 'Vitrola' : item.label}
                                        </button>
                                    )
                                })}
                            </div>

                            {isMobile && focusedTarget === 'overview' && (
                                <p className="text-[10px] uppercase tracking-[0.2em] text-cafe-900/75 bg-cafe-100/70 px-3 py-1 rounded-full">
                                    Arraste para olhar • Toque para aproximar
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Botao para voltar ao 3D caso o usuario tenha escolhido Modo 2D */}
                {forceStatic && webglSupported && !contextLost && (
                    <button
                        type="button"
                        onClick={() => setForceStatic(false)}
                        className="fixed bottom-5 left-5 z-40 rounded-full bg-cafe-900 text-cafe-100 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] shadow-lg"
                    >
                        Voltar ao 3D
                    </button>
                )}
            </div>

            {/* Player flutuante sincronizado com a vitrola (sem autoplay) */}
            {p.hasPlaylist && (
                <PlaylistPlayer
                    embeds={playlistEmbeds}
                    isPlaying={isPlaying}
                    onTogglePlay={handleTogglePlay}
                    drawerOpen={musicDrawerOpen}
                    onSetDrawerOpen={handleOpenMusicDrawer}
                />
            )}

            <AnimatePresence>
                {openId && (
                    <Panel
                        panels={p.panels}
                        openId={openId}
                        onOpen={id => {
                            if (id === 'musicas') {
                                setOpenId(null)
                                handleOpenMusicDrawer(true)
                            } else {
                                setOpenId(id)
                            }
                        }}
                        onClose={() => setOpenId(null)}
                    />
                )}
            </AnimatePresence>
        </section>
    )
}
