import { lazy, Suspense, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { ArrowRight, Music2, X } from 'lucide-react'

// Hero "entrar pela porta": ao rolar, a câmera mergulha no arco até o sol (creme) tomar a tela
// e revela uma sala 3D (CSS 3D, sem three.js) decorada com fotos, quadro de avisos e vitrola.
// As palavras nas paredes abrem painéis com o conteúdo do evento.
// ponytail: sala montada com planos CSS + SVG; se quiser objetos arrastáveis/modelos, aí sim three.js

// Cena WebGL (three.js) carregada sob demanda só na home
const Experience3D = lazy(() => import('./scene3d/Experience3D'))

// WebGL disponível e sem "reduzir movimento" -> cena 3D; senão, a sala em CSS
const canUse3D = () => {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    try {
        const c = document.createElement('canvas')
        return !!(c.getContext('webgl2') || c.getContext('webgl'))
    } catch {
        return false
    }
}

export type ScenePanel = { id: string; label: string; title: ReactNode; subtitle?: string; content: ReactNode }
export type ScenePhoto = { url: string; label?: string | null }

// Janela em arco com o sol nascendo; com image vira uma foto em arco
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
                            <line key={i} x1="100" y1="140" x2="100" y2="126" stroke="#F3E7D6" strokeWidth="3" strokeLinecap="round"
                                transform={`rotate(${i * 30 - 165} 100 190)`} />
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

// Selo redondo girando com o CTA
export const SpinBadge = ({ to, label }: { to: string; label: string }) => (
    <Link to={to} aria-label={label} className="group relative block w-32 h-32 md:w-36 md:h-36">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_14s_linear_infinite] motion-reduce:animate-none" aria-hidden="true">
            <defs>
                <path id="badge-circle" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
            </defs>
            <circle cx="50" cy="50" r="49" fill="#2B1B14" />
            <text fill="#F3E7D6" fontSize="7.4" fontWeight="700">
                <textPath href="#badge-circle" textLength="236" lengthAdjust="spacing">{`${label.toUpperCase()} • ${label.toUpperCase()} • `}</textPath>
            </text>
        </svg>
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-cafe-100 text-cafe-900 flex items-center justify-center transition-transform group-hover:scale-110">
            <ArrowRight size={20} />
        </span>
    </Link>
)

// Disco de vinil (vitrola da sala e mini player)
const Vinyl = ({ className, spinning = true }: { className: string; spinning?: boolean }) => (
    <svg viewBox="0 0 100 100" className={`${className} ${spinning ? 'animate-[spin_3s_linear_infinite] motion-reduce:animate-none' : ''}`} aria-hidden="true">
        <circle cx="50" cy="50" r="49" fill="#1a110c" />
        {[42, 36, 30].map(r => <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="#3a2a22" strokeWidth=".8" />)}
        <circle cx="50" cy="50" r="16" fill="#C9B19C" />
        <path d="M50 38 A12 12 0 0 1 62 50" stroke="#8B6A55" strokeWidth="3" fill="none" />
        <circle cx="50" cy="50" r="2" fill="#1a110c" />
    </svg>
)

// Palavra curva (como "WORKS" na referência) que abre um painel
const ArcWord = ({ panel, onOpen, color = '#F3E7D6' }: { panel?: ScenePanel; onOpen: (id: string) => void; color?: string }) => {
    if (!panel) return null
    return (
        <button type="button" onClick={() => onOpen(panel.id)} className="block group cursor-pointer" aria-label={`Abrir ${panel.label}`}>
            <svg viewBox="0 0 560 180" className="w-[500px] h-[160px] overflow-visible">
                <defs>
                    <path id={`arc-${panel.id}`} d="M10 170 Q280 -20 550 170" />
                </defs>
                <text fill={color} fontSize="50" fontWeight="200" letterSpacing="5" className="font-display uppercase transition-opacity group-hover:opacity-70">
                    <textPath href={`#arc-${panel.id}`} startOffset="50%" textAnchor="middle">{panel.label}</textPath>
                </text>
                <text x="280" y="150" textAnchor="middle" fill={color} fontSize="44" fontWeight="200">+</text>
            </svg>
        </button>
    )
}

// Foto emoldurada pendurada na parede
const Frame = ({ photo, className, rotate, onClick }: { photo?: ScenePhoto; className: string; rotate: number; onClick: () => void }) =>
    photo ? (
        <button
            type="button"
            onClick={onClick}
            className={`absolute bg-[#F3E7D6] p-2 pb-6 shadow-[0_12px_30px_rgba(0,0,0,.35)] transition-transform hover:scale-105 ${className}`}
            style={{ rotate: `${rotate}deg` }}
            aria-label={photo.label || 'Ver fotos'}
        >
            <img src={photo.url} alt={photo.label || ''} loading="lazy" className="w-full h-full object-cover" />
        </button>
    ) : null

const ROOM_W = 900
const ROOM_H = 560

const Room = ({ mx, my, progress, panels, photos, info, onOpen }: {
    mx: MotionValue<number>
    my: MotionValue<number>
    progress: MotionValue<number>
    panels: ScenePanel[]
    photos: ScenePhoto[]
    info: string[]
    onOpen: (id: string) => void
}) => {
    const walkZ = useTransform(progress, [0.4, 1], [-900, -250])
    const baseY = useTransform(progress, [0.4, 1], [-52, -40])
    const rotY = useTransform([baseY, mx] as MotionValue<number>[], ([b, m]: number[]) => b + m * 8)
    const rotX = useTransform(my, m => -10 - m * 5)
    const byId = (id: string) => panels.find(p => p.id === id)
    const openPhotos = () => onOpen('fotos')
    // ponytail: escala calculada 1x na montagem; girar o celular não recalcula
    const fit = Math.min(1, Math.max(0.5, window.innerWidth / 1000))

    const plane = 'absolute left-1/2 top-1/2 [backface-visibility:hidden]'
    return (
        <div className="absolute inset-0 overflow-hidden [perspective:1100px]">
            <motion.div
                className="absolute left-1/2 top-[55%] [transform-style:preserve-3d]"
                style={{ z: walkZ, rotateX: rotX, rotateY: rotY, scale: fit }}
            >
                {/* Parede do fundo: programação + quadro de avisos + sol */}
                <div
                    className={plane}
                    style={{ width: ROOM_W, height: ROOM_H, transform: `translate(-50%,-50%) translateZ(${-ROOM_W / 2}px)`, background: 'linear-gradient(180deg,#8B6A55,#6E4B3B)' }}
                >
                    <div className="absolute left-1/2 top-10 -translate-x-1/2"><ArcWord panel={byId('informacoes')} onOpen={onOpen} /></div>
                    {info.length > 0 && (
                        <button
                            type="button"
                            onClick={() => onOpen('informacoes')}
                            className="absolute left-16 bottom-16 w-64 bg-[#2B1B14] text-[#F3E7D6] p-5 text-left shadow-[0_14px_30px_rgba(0,0,0,.35)] -rotate-2 hover:rotate-0 transition-transform"
                        >
                            <span className="block text-[10px] tracking-[0.35em] uppercase text-[#C9B19C] mb-3">Quadro de avisos</span>
                            {info.map(line => <span key={line} className="block font-news text-lg leading-snug">{line}</span>)}
                        </button>
                    )}
                    <svg viewBox="0 0 100 100" className="absolute right-16 bottom-12 w-36 h-36 animate-[spin_40s_linear_infinite] motion-reduce:animate-none" aria-hidden="true">
                        {Array.from({ length: 16 }, (_, i) => (
                            <path key={i} d="M50 50 Q54 30 50 6 Q46 30 50 50" fill="#F3E7D6" opacity=".85" transform={`rotate(${i * 22.5} 50 50)`} />
                        ))}
                        <circle cx="50" cy="50" r="13" fill="#F3E7D6" />
                    </svg>
                    <Frame photo={photos[3]} onClick={openPhotos} rotate={3} className="right-64 bottom-24 w-32 h-40" />
                </div>
                {/* Parede da esquerda: parede de fotos + cruz */}
                <div
                    className={plane}
                    style={{ width: ROOM_W, height: ROOM_H, transform: `translate(-50%,-50%) rotateY(90deg) translateZ(${-ROOM_W / 2}px)`, background: 'linear-gradient(180deg,#5A3B2E,#4A2F24)' }}
                >
                    <div className="absolute left-1/2 top-10 -translate-x-1/2"><ArcWord panel={byId('fotos')} onOpen={onOpen} /></div>
                    <Frame photo={photos[0]} onClick={openPhotos} rotate={-4} className="left-24 top-48 w-44 h-56" />
                    <Frame photo={photos[1]} onClick={openPhotos} rotate={2} className="left-[340px] top-44 w-52 h-40" />
                    <Frame photo={photos[2]} onClick={openPhotos} rotate={-2} className="left-[600px] top-52 w-40 h-52" />
                    <svg viewBox="0 0 40 60" className="absolute left-[400px] bottom-10 w-12 h-20" aria-hidden="true">
                        <rect x="17" y="0" width="6" height="60" fill="#C9B19C" />
                        <rect x="4" y="14" width="32" height="6" fill="#C9B19C" />
                    </svg>
                </div>
                {/* Chão: crianças, inscrição e a vitrola */}
                <div
                    className={plane}
                    style={{
                        width: ROOM_W, height: ROOM_W,
                        transform: `translate(-50%,-50%) translateY(${ROOM_H / 2}px) rotateX(90deg)`,
                        background: 'radial-gradient(circle at 50% 50%, #E5D3BE 0%, #C9B19C 45%, #A88D76 100%)'
                    }}
                >
                    {/* Tapete da área kids */}
                    <div className="absolute left-[8%] top-[10%] w-80 h-56 rounded-[40%] bg-[#F3E7D6]/70 border-4 border-dashed border-[#8B6A55]/40" />
                    <div className="absolute left-[3%] top-[12%]"><ArcWord panel={byId('criancas')} onOpen={onOpen} color="#5A3B2E" /></div>
                    <div className="absolute left-1/2 top-[64%] -translate-x-1/2 -translate-y-1/2"><ArcWord panel={byId('inscricao')} onOpen={onOpen} color="#2B1B14" /></div>
                    {/* Vitrola num móvel baixo */}
                    {byId('musicas') && (
                        <button
                            type="button"
                            onClick={() => onOpen('musicas')}
                            aria-label="Abrir músicas"
                            className="absolute right-[10%] top-[12%] w-56 h-44 bg-[#5A3B2E] rounded-md shadow-[0_20px_40px_rgba(43,27,20,.4)] flex items-center justify-center gap-3 hover:scale-105 transition-transform"
                        >
                            <Vinyl className="w-32 h-32" />
                            <span className="w-1.5 h-24 bg-[#C9B19C] rounded-full rotate-[20deg] -ml-6 mt-4" />
                        </button>
                    )}
                    {/* Foto caída no chão, como polaroid */}
                    <Frame photo={photos[4]} onClick={openPhotos} rotate={-12} className="left-[46%] top-[34%] w-32 h-40" />
                </div>
            </motion.div>

            {/* Luminária pendurada (fora do 3D, balançando) */}
            <div className="absolute left-1/2 top-0 -translate-x-1/2 origin-top animate-[dna-swing_5s_ease-in-out_infinite] motion-reduce:animate-none pointer-events-none" aria-hidden="true">
                <div className="mx-auto w-px h-[18vh] bg-cafe-900/60" />
                <div className="w-28 h-20 -mt-1 rounded-[50%] bg-gradient-to-b from-[#C98A55] to-[#8B5A35] shadow-[0_20px_80px_30px_rgba(243,231,214,.45)]" />
            </div>
        </div>
    )
}

// Painel (como o "Photography" da referência): trilho de abas + título + conteúdo
const Panel = ({ panels, openId, onOpen, onClose }: { panels: ScenePanel[]; openId: string; onOpen: (id: string) => void; onClose: () => void }) => {
    const idx = panels.findIndex(p => p.id === openId)
    const panel = panels[idx]
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
            <button type="button" aria-label="Fechar" onClick={onClose} className="hidden md:block flex-1 bg-cafe-900/40 backdrop-blur-[2px] cursor-default" />
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
                {/* Trilho de abas */}
                <nav className="hidden md:flex flex-col gap-1 m-6 mr-0 p-2 w-14 rounded-2xl border border-cafe-100/15 overflow-y-auto [scrollbar-width:none]">
                    {panels.map((p, i) => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => onOpen(p.id)}
                            className={`flex flex-col items-center gap-2 py-3 rounded-xl text-[10px] tracking-[0.25em] uppercase transition-colors ${p.id === openId ? 'bg-cafe-100 text-cafe-900' : 'text-cafe-300 hover:text-cafe-100'}`}
                        >
                            <span className="[writing-mode:vertical-rl] rotate-180">{p.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="flex-1 overflow-y-auto px-6 md:px-12 pt-20 md:pt-14 pb-16">
                    <button type="button" onClick={onClose} aria-label="Fechar" className="absolute top-5 right-5 w-11 h-11 rounded-full border border-cafe-100/25 flex items-center justify-center hover:bg-cafe-100 hover:text-cafe-900 transition-colors">
                        <X size={18} />
                    </button>
                    {/* Abas no celular */}
                    <div className="md:hidden flex gap-2 overflow-x-auto pb-4 -mx-1 px-1">
                        {panels.map(p => (
                            <button key={p.id} type="button" onClick={() => onOpen(p.id)}
                                className={`shrink-0 px-4 py-2 rounded-full text-xs uppercase tracking-widest ${p.id === openId ? 'bg-cafe-100 text-cafe-900' : 'border border-cafe-100/20 text-cafe-300'}`}>
                                {p.label}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div key={panel.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
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
    delay: number
}

export const EventHeroScene = (p: Props) => {
    const ref = useRef<HTMLDivElement>(null)
    const [openId, setOpenId] = useState<string | null>(null)
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
    const hasMusic = p.hasPlaylist
    const [use3D] = useState(canUse3D)

    // Mouse -> inclinação 3D (suavizada)
    const mxRaw = useMotionValue(0)
    const myRaw = useMotionValue(0)
    const mx = useSpring(mxRaw, { stiffness: 60, damping: 15 })
    const my = useSpring(myRaw, { stiffness: 60, damping: 15 })
    const onMove = (e: MouseEvent) => {
        mxRaw.set((e.clientX / window.innerWidth) * 2 - 1)
        myRaw.set((e.clientY / window.innerHeight) * 2 - 1)
    }

    // Coreografia da rolagem
    const archScale = useTransform(scrollYProgress, [0, 0.38], [1, 9])
    const archRotY = useTransform(mx, m => m * 12)
    const archRotX = useTransform(my, m => -m * 8)
    const fadeOut = useTransform(scrollYProgress, use3D ? [0, 0.5] : [0, 0.18], [1, 0])
    // eco/fantasma do título (só na cena 3D): cópia deslocada em outra cor
    const echoX = useTransform(scrollYProgress, [0, 0.5], [0, 28])
    const echoOpacity = useTransform(scrollYProgress, [0, 0.08, 0.5], [0, 0.55, 0])
    const overlayEvents = useTransform(scrollYProgress, v => (v > 0.45 ? 'none' : 'auto'))
    const titleY = useTransform(scrollYProgress, [0, 0.25], [0, -160])
    const titleSpread = useTransform(scrollYProgress, [0, 0.25], ['-0.01em', '0.25em'])
    const sunFill = useTransform(scrollYProgress, [0.28, 0.4], [0, 1])
    const roomOpacity = useTransform(scrollYProgress, [0.4, 0.55], [0, 1])
    const roomEvents = useTransform(roomOpacity, o => (o > 0.5 ? 'auto' : 'none'))

    return (
        <section id="sobre" ref={ref} className="relative h-[320vh]" onMouseMove={onMove}>
            <div className="sticky top-0 h-screen overflow-hidden pt-24 px-5 md:px-12">
                {use3D && (
                    <Suspense fallback={null}>
                        <Experience3D
                            progress={scrollYProgress}
                            labels={p.panels.map(x => ({ id: x.id, label: x.label }))}
                            photos={p.photos}
                            onOpen={setOpenId}
                        />
                    </Suspense>
                )}
                <motion.div style={{ opacity: fadeOut }} className="flex justify-between text-[11px] tracking-[0.3em] uppercase text-cafe-500 mb-4">
                    <span className="hidden md:inline">Comunidade Voz de Deus</span>
                    <span className="md:text-right">
                        {p.days !== null && p.days > 0 && <><span className="text-cafe-900 font-bold">faltam {p.days} dias</span><br /></>}
                        <span className="hidden md:inline">{p.location}</span>
                    </span>
                </motion.div>

                {use3D && (
                    <motion.div
                        aria-hidden="true"
                        style={{ x: echoX, y: titleY, opacity: echoOpacity }}
                        className="absolute left-5 md:left-12 top-[8.5rem] font-display font-thin uppercase text-cafe-300 leading-[0.85] text-[17vw] md:text-[10.5vw] pointer-events-none"
                    >
                        {p.titleMain}
                    </motion.div>
                )}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: p.delay }}
                    style={{ y: titleY, letterSpacing: titleSpread }}
                    className="relative z-10 font-display font-thin uppercase text-cafe-700 leading-[0.85] text-[17vw] md:text-[10.5vw]"
                >
                    <motion.span style={{ opacity: fadeOut }}>
                        {p.titleMain}
                        {p.titleYear && <span className="text-cafe-500 text-[0.45em] align-top ml-3">{p.titleYear}</span>}
                    </motion.span>
                </motion.h1>

                <motion.div style={use3D ? { pointerEvents: overlayEvents } : undefined} className="relative grid md:grid-cols-[1fr_auto_1fr] items-end gap-6 mt-4 md:-mt-[1.5vw]">
                    <motion.div style={{ opacity: fadeOut }} className="order-2 md:order-1 md:pb-10 space-y-3">
                        {p.tagline && <p className="font-news text-3xl md:text-4xl text-cafe-900">{p.tagline}</p>}
                        {p.datesText && <p className="text-sm tracking-[0.2em] uppercase text-cafe-500">{p.datesText}</p>}
                        {p.minAge && <p className="text-sm text-cafe-700">Inscrição para maiores de {p.minAge} anos</p>}
                    </motion.div>

                    <div className="order-1 md:order-2 relative mx-auto [perspective:900px]" style={{ width: 'min(62vw, 340px, 44vh)' }}>
                        {use3D ? (
                            // a porta de verdade está na cena 3D; aqui só reserva o espaço
                            <div className="aspect-[200/260]" />
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1.2, delay: p.delay + 0.2 }}
                            >
                                {/* origem no sol: o zoom termina dentro dele */}
                                <motion.div
                                    className="aspect-[200/260] will-change-transform"
                                    style={{ scale: archScale, rotateY: archRotY, rotateX: archRotX, transformOrigin: '50% 73%' }}
                                >
                                    <ArchWindow image={p.image} alt={p.eventName} />
                                </motion.div>
                            </motion.div>
                        )}
                        {p.registerUrl && (
                            <motion.div style={{ opacity: fadeOut }} className="absolute -right-10 md:-right-16 bottom-6 z-10">
                                <SpinBadge to={p.registerUrl} label={p.badgeLabel} />
                            </motion.div>
                        )}
                    </div>

                    <motion.div style={{ opacity: fadeOut }} className="hidden md:block order-3 md:pb-10 md:text-right">
                        {p.description && <p className="text-cafe-700 text-lg leading-relaxed max-w-sm md:ml-auto">{p.description}</p>}
                    </motion.div>
                </motion.div>


                {use3D ? (
                    <motion.div style={{ opacity: roomOpacity }} className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[11px] tracking-[0.35em] uppercase text-cafe-900/70 text-center pointer-events-none">
                        Toque numa palavra, num quadro ou na vitrola
                    </motion.div>
                ) : (
                    <>
                        {/* O sol toma a tela */}
                        <motion.div style={{ opacity: sunFill }} className="absolute inset-0 bg-cafe-100 pointer-events-none" />

                        {/* A sala */}
                        <motion.div style={{ opacity: roomOpacity, pointerEvents: roomEvents }} className="absolute inset-0">
                            <Room mx={mx} my={my} progress={scrollYProgress} panels={p.panels} photos={p.photos} info={p.info} onOpen={setOpenId} />
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[11px] tracking-[0.35em] uppercase text-cafe-900/70 text-center">
                                Toque numa parede ou num quadro
                            </div>
                        </motion.div>
                    </>
                )}
            </div>

            {/* Mini player (como o da referência): abre o painel de músicas */}
            {hasMusic && (
                <button
                    type="button"
                    onClick={() => setOpenId('musicas')}
                    className="fixed bottom-5 right-5 z-50 flex items-center gap-3 pl-2 pr-5 py-2 rounded-full bg-cafe-100/95 border border-cafe-700/15 shadow-[0_10px_30px_rgba(43,27,20,.2)] backdrop-blur hover:scale-[1.03] transition-transform"
                    aria-label="Abrir playlist do retiro"
                >
                    <Vinyl className="w-11 h-11" />
                    <span className="text-left leading-tight">
                        <span className="block text-[10px] tracking-[0.3em] uppercase text-cafe-500">Playlist</span>
                        <span className="block font-news text-lg text-cafe-900">Músicas do retiro</span>
                    </span>
                    <Music2 size={18} className="text-cafe-700" />
                </button>
            )}

            <AnimatePresence>
                {openId && <Panel panels={p.panels} openId={openId} onOpen={setOpenId} onClose={() => setOpenId(null)} />}
            </AnimatePresence>
        </section>
    )
}
