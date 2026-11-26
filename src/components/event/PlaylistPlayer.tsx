import { useEffect, useState } from 'react'
import { Music2, Pause, Play, X } from 'lucide-react'

export const spotifyEmbed = (url?: string) => {
    const m = url?.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(playlist|album|track|artist)\/([A-Za-z0-9]+)/)
    return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}?theme=0` : null
}

/** Disco de vinil SVG original (vitrola e mini player) */
export function Vinyl({ className, spinning = true }: { className: string; spinning?: boolean }) {
    return (
        <svg
            viewBox="0 0 100 100"
            className={`${className} ${spinning ? 'animate-[spin_3s_linear_infinite] motion-reduce:animate-none' : ''}`}
            aria-hidden="true"
        >
            <circle cx="50" cy="50" r="49" fill="#1a110c" />
            {[42, 36, 30].map(r => (
                <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="#3a2a22" strokeWidth=".8" />
            ))}
            <circle cx="50" cy="50" r="16" fill="#C9B19C" />
            <path d="M50 38 A12 12 0 0 1 62 50" stroke="#8B6A55" strokeWidth="3" fill="none" />
            <circle cx="50" cy="50" r="2" fill="#1a110c" />
        </svg>
    )
}

export interface PlaylistPlayerProps {
    embeds: string[]
    isPlaying: boolean
    onTogglePlay: () => void
    drawerOpen: boolean
    onSetDrawerOpen: (open: boolean) => void
}

/**
 * Mini player flutuante no estilo original ("Playlist / Músicas do retiro" + disco de vinil)
 * + gaveta lateral escura "Na vitrola" com as abas Álbum/Artista do Spotify e play/pause sincronizado com a Vitrola 3D.
 */
export function PlaylistPlayer({
    embeds,
    isPlaying,
    onTogglePlay,
    drawerOpen,
    onSetDrawerOpen,
}: PlaylistPlayerProps) {
    const [currentEmbed, setCurrentEmbed] = useState(0)

    useEffect(() => {
        if (!drawerOpen) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onSetDrawerOpen(false)
        }
        window.addEventListener('keydown', onKey)
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            window.removeEventListener('keydown', onKey)
            document.body.style.overflow = prev
        }
    }, [drawerOpen, onSetDrawerOpen])

    return (
        <>
            {/* Mini player no visual original: clicar no vinil toca/pausa; clicar no texto abre o painel "Músicas do retiro" */}
            <div
                data-testid="playlist-player"
                data-playing={isPlaying ? 'true' : 'false'}
                className="fixed bottom-5 right-5 z-40 flex items-center gap-2 pl-2 pr-4 py-2 rounded-full bg-cafe-100/95 border border-cafe-700/15 shadow-[0_10px_30px_rgba(43,27,20,.2)] backdrop-blur transition-transform hover:scale-[1.02]"
            >
                <button
                    type="button"
                    data-testid="playlist-toggle"
                    onClick={onTogglePlay}
                    aria-pressed={isPlaying}
                    aria-label={isPlaying ? 'Pausar música do retiro' : 'Tocar música do retiro'}
                    className="relative flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cafe-900"
                    title={isPlaying ? 'Pausar música' : 'Tocar música'}
                >
                    <Vinyl className="w-11 h-11" spinning={isPlaying} />
                    <span className="absolute inset-0 flex items-center justify-center rounded-full bg-cafe-900/35 text-cafe-100">
                        {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                    </span>
                </button>

                <button
                    type="button"
                    data-testid="playlist-open-drawer"
                    onClick={() => onSetDrawerOpen(true)}
                    aria-label="Abrir playlist do retiro"
                    className="flex items-center gap-3 pr-1 text-left leading-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cafe-900 rounded-full"
                >
                    <span>
                        <span className="block text-[10px] tracking-[0.3em] uppercase text-cafe-500">
                            {isPlaying ? 'Tocando agora' : 'Playlist'}
                        </span>
                        <span className="block font-news text-lg text-cafe-900">Músicas do retiro</span>
                    </span>
                    <Music2 size={18} className="text-cafe-700" />
                </button>
            </div>

            {/* Gaveta lateral original "Na vitrola" */}
            {drawerOpen && (
                <div className="fixed inset-0 z-[70] flex">
                    <button
                        type="button"
                        aria-label="Fechar"
                        onClick={() => onSetDrawerOpen(false)}
                        className="hidden md:block flex-1 bg-cafe-900/40 backdrop-blur-[2px] cursor-default"
                    />
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Músicas"
                        className="relative ml-auto w-full md:w-[min(920px,82vw)] h-full bg-cafe-900 text-cafe-100 flex flex-col overflow-y-auto px-6 md:px-12 pt-16 md:pt-14 pb-16 shadow-2xl"
                    >
                        <button
                            type="button"
                            onClick={() => onSetDrawerOpen(false)}
                            aria-label="Fechar"
                            className="absolute top-5 right-5 w-11 h-11 rounded-full border border-cafe-100/25 flex items-center justify-center hover:bg-cafe-100 hover:text-cafe-900 transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <h2 className="font-display text-4xl md:text-6xl font-light text-cafe-100">
                            Na <em className="not-italic text-cafe-300">vitrola</em>
                        </h2>
                        <p className="font-news italic text-xl text-cafe-300 mt-2">Ouça antes de chegar.</p>

                        <div className="h-px bg-cafe-100/15 my-7" />

                        {/* Controle rápido de prévia direta da Tribus da Cruz */}
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cafe-100/15 bg-cafe-100/5 px-5 py-4">
                            <div className="flex items-center gap-3">
                                <Vinyl className="w-10 h-10 shrink-0" spinning={isPlaying} />
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.25em] text-cafe-300">Prévia na vitrola</p>
                                    <p className="font-news text-lg text-cafe-100">Tribus da Cruz</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onTogglePlay}
                                className="inline-flex items-center gap-2 rounded-full bg-cafe-100 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-cafe-900 hover:bg-cafe-300 transition-colors"
                            >
                                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                                <span>{isPlaying ? 'Pausar prévia' : 'Tocar prévia'}</span>
                            </button>
                        </div>

                        {embeds.length ? (
                            <>
                                {embeds.length > 1 && (
                                    <div className="flex flex-wrap gap-3 mb-6">
                                        {embeds.map((url, i) => (
                                            <button
                                                key={url}
                                                type="button"
                                                onClick={() => setCurrentEmbed(i)}
                                                className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.2em] transition-colors ${
                                                    i === currentEmbed
                                                        ? 'bg-cafe-100 text-cafe-900 font-bold'
                                                        : 'border border-cafe-100/25 text-cafe-300 hover:text-cafe-100'
                                                }`}
                                            >
                                                {url.includes('/artist/') ? 'Artista' : url.includes('/album/') ? 'Álbum' : 'Playlist'}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <iframe
                                    key={embeds[currentEmbed]}
                                    title="Músicas do retiro"
                                    src={embeds[currentEmbed]}
                                    className="w-full h-[480px] rounded-xl border-0"
                                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                    loading="lazy"
                                />
                            </>
                        ) : (
                            <p className="font-news italic text-2xl text-cafe-300">A playlist do retiro chega em breve.</p>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
