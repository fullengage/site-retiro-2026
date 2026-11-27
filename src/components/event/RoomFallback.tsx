import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, Disc3, HeartHandshake, Images, Pause, Play, Sparkles } from 'lucide-react'
import type { ScenePanel, ScenePhoto } from './EventHeroScene'

interface RoomFallbackProps {
    panels: ScenePanel[]
    photos: ScenePhoto[]
    info: string[]
    isPlaying: boolean
    registerUrl?: string
    badgeLabel: string
    onOpenPanel: (id: string) => void
    onTogglePlay: () => void
}

const FALLBACK_PHOTOS: ScenePhoto[] = [
    { url: '/images/comunidade-matriz.jpg', label: 'Comunidade Voz de Deus na Matriz' },
    { url: '/images/tendadoração2025.jpg', label: 'Oração em comunidade' },
    { url: '/images/ensaiohoje.jpeg', label: 'Partilha e acolhimento' },
    { url: '/images/ensaiohoje2.jpeg', label: 'Música e comunhão' },
]

/**
 * Experiencia alternativa acessivel para dispositivos sem WebGL, perda de contexto ou modo leve.
 * Mantem o conceito "A Casa que Acolhe", logo da Comunidade, fotos reais, vitrola e inscricao acessivel.
 */
export function RoomFallback({
    panels,
    photos,
    info,
    isPlaying,
    registerUrl,
    badgeLabel,
    onOpenPanel,
    onTogglePlay,
}: RoomFallbackProps) {
    const has = (id: string) => panels.some(p => p.id === id)
    const displayPhotos = [FALLBACK_PHOTOS[0], ...(photos.length ? photos : FALLBACK_PHOTOS.slice(1))].slice(0, 4)

    return (
        <div
            data-testid="room-fallback"
            className="relative w-full h-full overflow-y-auto bg-gradient-to-br from-[#F4E8D7] via-[#EAD8C0] to-[#D4BA9E] text-cafe-900 pt-20 pb-24 px-4 sm:px-8"
        >
            {/* Raios suaves de luz natural pela janela esquerda */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -left-16 w-[60%] h-[120%] rotate-12 bg-gradient-to-r from-[#FFF7E6]/65 via-[#FFE7BE]/25 to-transparent blur-2xl"
            />

            <div className="relative z-10 max-w-6xl mx-auto flex flex-col gap-6">
                {/* Cabecalho da sala com o logo da Comunidade Voz de Deus */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-cafe-700/15 bg-cafe-100/80 backdrop-blur-md px-5 py-4 shadow-[0_14px_34px_rgba(43,27,20,0.08)]">
                    <div className="flex items-center gap-4">
                        <img
                            src="/images/logo-comunidade-cafe.webp"
                            alt="Comunidade Voz de Deus"
                            className="h-10 sm:h-12 w-auto object-contain"
                        />
                        <div className="hidden sm:block h-8 w-px bg-cafe-700/20" />
                        <div className="hidden sm:block">
                            <p className="text-[10px] uppercase tracking-[0.28em] text-cafe-500">Conceito</p>
                            <p className="font-news italic text-lg text-cafe-900">A Casa que Acolhe</p>
                        </div>
                    </div>

                    {registerUrl && (
                        <Link
                            to={registerUrl}
                            data-testid="room-register-cta"
                            className="inline-flex items-center gap-2 rounded-full bg-cafe-900 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-cafe-100 shadow-md hover:bg-cafe-700 transition-colors"
                        >
                            <span>{badgeLabel}</span>
                            <ArrowRight size={15} />
                        </Link>
                    )}
                </div>

                {/* Grade principal da sala */}
                <div className="grid lg:grid-cols-12 gap-5">
                    {/* Santuario + Programacao */}
                    <div className="lg:col-span-5 rounded-3xl border border-cafe-700/15 bg-[#3B251B] text-cafe-100 p-6 shadow-xl flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between gap-3 mb-5">
                                <span className="text-[10px] uppercase tracking-[0.3em] text-cafe-300">
                                    Espiritualidade & Programação
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full border border-cafe-100/20 px-2.5 py-1 text-[10px] uppercase tracking-widest text-[#FFE1AE]">
                                    <Sparkles size={12} /> Altar da Casa
                                </span>
                            </div>

                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-16 h-16 rounded-full border border-[#C89B54]/60 bg-[#2B1B14] flex items-center justify-center p-2 shrink-0">
                                    <img
                                        src="/images/logo-comunidade-emblema.png"
                                        alt="Emblema Comunidade Voz de Deus"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-news text-2xl text-cafe-100">Retiro DNA 2026</h3>
                                    <p className="text-xs uppercase tracking-[0.2em] text-cafe-300 mt-1">
                                        Fé, serviço e comunhão à mesa
                                    </p>
                                </div>
                            </div>

                            <ul className="space-y-2 text-sm text-cafe-100/90 border-t border-cafe-100/15 pt-4">
                                {(info.length ? info : ['12 e 13 de dezembro', 'Comunidade Voz de Deus']).map(line => (
                                    <li key={line} className="leading-snug">
                                        {line}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2.5">
                            {has('informacoes') && (
                                <button
                                    type="button"
                                    onClick={() => onOpenPanel('informacoes')}
                                    className="inline-flex items-center gap-2 rounded-full bg-cafe-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-cafe-900 hover:bg-cafe-300 transition-colors"
                                >
                                    <Calendar size={14} /> Programação
                                </button>
                            )}
                            {has('criancas') && (
                                <button
                                    type="button"
                                    onClick={() => onOpenPanel('criancas')}
                                    className="inline-flex items-center gap-2 rounded-full border border-cafe-100/30 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-cafe-100 hover:bg-cafe-100/10 transition-colors"
                                >
                                    <HeartHandshake size={14} /> Área Crianças
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mural de Fotos Reais da Comunidade */}
                    <div className="lg:col-span-7 flex flex-col gap-5">
                        <div className="rounded-3xl border border-cafe-700/15 bg-cafe-100/85 p-5 shadow-lg">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-cafe-700">
                                    Memórias da Comunidade
                                </span>
                                {has('fotos') && (
                                    <button
                                        type="button"
                                        onClick={() => onOpenPanel('fotos')}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em] text-cafe-900 hover:text-cafe-500"
                                    >
                                        <Images size={14} /> Ver quadros
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {displayPhotos.map((ph, i) => (
                                    <button
                                        key={`${ph.url}-${i}`}
                                        type="button"
                                        onClick={() => onOpenPanel('fotos')}
                                        className="group overflow-hidden rounded-xl border-2 border-[#5A3B2E]/25 bg-white p-1.5 shadow-sm transition-transform hover:-translate-y-0.5 text-left"
                                    >
                                        <img
                                            src={ph.url}
                                            alt={ph.label || `Foto ${i + 1}`}
                                            className="w-full aspect-[4/3] object-cover rounded-lg"
                                        />
                                        {ph.label && (
                                            <span className="mt-1.5 block truncate text-[11px] font-medium text-cafe-700">
                                                {ph.label}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Canto da Vitrola */}
                        {has('musicas') && (
                            <div className="rounded-3xl border border-cafe-700/15 bg-[#2B1B14] text-cafe-100 p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`w-14 h-14 rounded-full bg-gradient-to-tr from-[#140D0A] via-[#3B261C] to-[#140D0A] border-2 border-[#C89B54]/60 flex items-center justify-center ${
                                            isPlaying ? 'animate-[spin_3s_linear_infinite] motion-reduce:animate-none' : ''
                                        }`}
                                    >
                                        <Disc3 size={24} className="text-[#FFE1AE]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.26em] text-cafe-300">
                                            Vitrola da Sala
                                        </p>
                                        <p className="font-news text-xl">Tribus da Cruz & Playlist do Retiro</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5">
                                    <button
                                        type="button"
                                        onClick={onTogglePlay}
                                        className="inline-flex items-center gap-2 rounded-full bg-cafe-100 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-cafe-900 hover:bg-cafe-300 transition-colors"
                                    >
                                        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                                        <span>{isPlaying ? 'Pausar' : 'Tocar prévia'}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onOpenPanel('musicas')}
                                        className="rounded-full border border-cafe-100/25 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-cafe-100 hover:bg-cafe-100/10 transition-colors"
                                    >
                                        Playlist completa
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
