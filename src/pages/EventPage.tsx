import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Loader2 } from 'lucide-react'
import { fetchActiveEvent, fetchEventBySlug } from '../services/eventService'
import { EventHeroScene, type ScenePanel, type ScenePhoto } from '../components/event/EventHeroScene'
import { supabase } from '../lib/supabase'
import { EventItem } from '../types/database'

// Texto do banco sem travessão (— ou –): vira hífen simples
const noDash = (t?: string) => (t || '').replace(/\s*[\u2014\u2013]\s*/g, ' - ')

// Músicas da comunidade (Tribus da Cruz): tocam quando o evento não tem links próprios no admin
const COMMUNITY_MUSIC = [
    'https://open.spotify.com/intl-pt/album/59DDsSybNWUZ8nGBGXrqsj',
    'https://open.spotify.com/intl-pt/artist/5S9z6eKVsdf3fZbTIRpbxI'
].join(' ')

// Link do Spotify (playlist/álbum/artista) -> URL do player embutido
export const spotifyEmbed = (url?: string) => {
    const m = url?.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(playlist|album|track|artist)\/([A-Za-z0-9]+)/)
    return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}?theme=0` : null
}

// Prateleira de músicas: vários links do Spotify (um por linha), escolhe qual toca
const MusicShelf = ({ embeds }: { embeds: string[] }) => {
    const [current, setCurrent] = useState(0)
    return (
        <>
            {embeds.length > 1 && (
                <div className="flex flex-wrap gap-3 mb-6">
                    {embeds.map((url, i) => (
                        <button
                            key={url}
                            type="button"
                            onClick={() => setCurrent(i)}
                            className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.2em] transition-colors ${i === current ? 'bg-cafe-100 text-cafe-900' : 'border border-cafe-100/25 text-cafe-300 hover:text-cafe-100'}`}
                        >
                            {url.includes('/artist/') ? 'Artista' : url.includes('/album/') ? 'Álbum' : 'Playlist'}
                        </button>
                    ))}
                </div>
            )}
            <iframe
                key={embeds[current]}
                title="Músicas do retiro"
                src={embeds[current]}
                className="w-full h-[480px] rounded-xl border-0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
            />
        </>
    )
}

const formatDate = (d?: string | null) =>
    d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }) : ''

const daysUntil = (d?: string | null) =>
    d ? Math.ceil((new Date(d + 'T12:00:00').getTime() - Date.now()) / 86400000) : null

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Abertura curta (1x por sessão): contador + frases tiradas da própria programação
const Intro = ({ title, phrases, onDone }: { title: string; phrases: string[]; onDone: () => void }) => {
    const [pct, setPct] = useState(0)
    useEffect(() => {
        const start = performance.now()
        let raf = 0
        const tick = (t: number) => {
            const p = Math.min(100, Math.round(((t - start) / 1800) * 100))
            setPct(p)
            if (p < 100) raf = requestAnimationFrame(tick)
            else setTimeout(onDone, 350)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [onDone])
    const phrase = phrases[Math.min(phrases.length - 1, Math.floor((pct / 100) * phrases.length))]

    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-cafe-900 text-cafe-100 flex flex-col items-center justify-center cursor-pointer px-6"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            onClick={onDone}
            role="status"
            aria-label={`Carregando ${title}`}
        >
            <div className="font-display font-thin uppercase text-[18vw] md:text-[10vw] leading-none text-cafe-300/80">{title}</div>
            <div className="mt-8 w-full max-w-sm h-px bg-cafe-500/40 relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-cafe-100" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-4 flex items-center gap-4 text-[11px] tracking-[0.3em] uppercase text-cafe-300">
                Preparando a casa <span className="text-cafe-100 tabular-nums">{String(pct).padStart(3, '0')}%</span>
            </div>
            <p className="mt-4 font-news italic text-2xl md:text-3xl text-cafe-100 text-center">{phrase}…</p>
        </motion.div>
    )
}

const SectionHead = ({ kicker }: { n?: number; total?: number; title?: string; kicker: ReactNode }) => (
    <div className="mb-10 border-b border-cafe-700/20 pb-4 [perspective:700px]">
        <motion.h2
            className="font-news text-4xl md:text-6xl leading-[1.1] pb-1 text-cafe-900 origin-bottom"
            initial={{ rotateX: 75, opacity: 0 }}
            whileInView={{ rotateX: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
        >
            {kicker}
        </motion.h2>
    </div>
)

// Página genérica de evento: tudo vem de events (+ events.content), editável em /admin/eventos
export const EventPage = ({ event: initial }: { event?: EventItem }) => {
    const { slug } = useParams()
    const [event, setEvent] = useState<EventItem | null>(initial || null)
    const [loading, setLoading] = useState(!initial)
    const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem('intro-seen') && !reducedMotion())
    const [photos, setPhotos] = useState<ScenePhoto[]>([])

    // Fotos da galeria do site decoram a sala e o painel "Fotos"
    useEffect(() => {
        supabase.from('gallery_images').select('url, label').order('created_at', { ascending: false }).limit(12)
            .then(({ data }) => setPhotos(data || []))
    }, [])

    useEffect(() => {
        if (initial) return
        setLoading(true)
        ;(slug ? fetchEventBySlug(slug) : fetchActiveEvent()).then(e => {
            setEvent(e)
            setLoading(false)
        })
    }, [slug, initial])

    const endIntro = () => {
        sessionStorage.setItem('intro-seen', '1')
        setShowIntro(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-cafe-700" />
            </div>
        )
    }

    if (!event) {
        return (
            <div className="min-h-screen pt-32 px-4 text-center text-cafe-700">
                Evento não encontrado. <Link to="/" className="underline">Voltar</Link>
            </div>
        )
    }

    const c = event.content || {}
    const minPrice = event.kit_options.length ? Math.min(...event.kit_options.map(k => k.price)) : null
    const canRegister = event.status === 'active' || event.status === 'upcoming'
    const registerUrl = `/inscricao?evento=${event.slug}`
    const dates = [formatDate(event.start_date), formatDate(event.end_date)].filter(Boolean)
    const days = daysUntil(event.start_date)
    const schedule = c.schedule || []
    const phrases = schedule.flatMap(d => d.items).slice(0, 4)

    // Seções numeradas só com o que existe no evento
    const sections = [
        schedule.length > 0 && 'programacao',
        c.kids_area?.enabled && 'criancas',
        canRegister && event.kit_options.length > 0 && 'inscricao'
    ].filter(Boolean) as string[]
    const num = (id: string) => sections.indexOf(id) + 1

    // "Retiro DNA 2026" -> título "Retiro DNA" + ano em itálico
    const yearMatch = event.name.match(/^(.*?)\s*(\d{4})$/)
    const titleMain = yearMatch ? yearMatch[1] : event.name
    const titleYear = yearMatch ? yearMatch[2] : ''

    // Quadro de avisos na parede
    const info = [
        dates.join(' e '),
        ...schedule.map(d => [noDash(d.title), d.hours].filter(Boolean).join(', ')),
        event.location || '',
        minPrice !== null ? `A partir de R$ ${minPrice}` : ''
    ].filter(Boolean)

    const playlists = (c.playlist_url || COMMUNITY_MUSIC).split(/\s+/).map(spotifyEmbed).filter(Boolean) as string[]

    // Painéis abertos pelas palavras da sala
    const panels: ScenePanel[] = [
        schedule.length > 0 && {
            id: 'informacoes',
            label: 'Programação',
            title: <>Dois dias, <em className="not-italic text-cafe-300">uma casa</em></>,
            subtitle: dates.join(' e ') + (event.location ? `, ${event.location}` : ''),
            content: (
                <div className="divide-y divide-cafe-100/10">
                    {schedule.map(day => (
                        <div key={day.title} className="grid md:grid-cols-[16rem_1fr] gap-4 py-6">
                            <div>
                                <h3 className="font-news text-3xl">{noDash(day.title)}</h3>
                                {day.hours && <p className="text-[11px] tracking-[0.3em] uppercase text-cafe-300 mt-2">{day.hours}</p>}
                            </div>
                            <ul className="space-y-3">
                                {day.items.map((item, i) => (
                                    <li key={item} className="flex gap-4 text-lg text-cafe-100/90">
                                        <span className="font-news italic text-cafe-500 w-6 shrink-0">{i + 1}</span>{item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )
        },
        c.kids_area?.enabled && {
            id: 'criancas',
            label: 'Crianças',
            title: <>Um espaço para os <em className="not-italic text-cafe-300">pequenos</em></>,
            content: (
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <p className="text-xl leading-relaxed text-cafe-100/90">{noDash(c.kids_area.description) || 'Teremos uma área especial para os filhos dos participantes.'}</p>
                    {canRegister && (
                        <Link to={registerUrl} className="inline-flex items-center gap-2 self-start px-6 py-3 rounded-full bg-cafe-100 text-cafe-900 font-bold uppercase tracking-[0.2em] text-xs">
                            Cadastrar meus filhos na inscrição <ArrowRight size={16} />
                        </Link>
                    )}
                </div>
            )
        },
        canRegister && event.kit_options.length > 0 && {
            id: 'inscricao',
            label: 'Inscrição',
            title: <>Garanta <em className="not-italic text-cafe-300">sua vaga</em></>,
            subtitle: c.min_age ? `Inscrição para maiores de ${c.min_age} anos` : undefined,
            content: (
                <>
                    <div className="divide-y divide-cafe-100/10 border-y border-cafe-100/10 mb-10">
                        {event.kit_options.map(kit => (
                            <Link key={kit.id} to={registerUrl} className="group flex items-center justify-between gap-6 py-6 px-2 hover:bg-cafe-100/5">
                                <span className="text-lg">{noDash(kit.name.replace(/\s*\(R\$[^)]*\)/, ''))}</span>
                                <span className="flex items-center gap-4">
                                    <span className="font-news text-4xl">R$ {kit.price}</span>
                                    <ArrowRight className="text-cafe-300 transition-transform group-hover:translate-x-1" />
                                </span>
                            </Link>
                        ))}
                    </div>
                    <Link to={registerUrl} className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-cafe-100 text-cafe-900 font-bold uppercase tracking-[0.2em] text-sm">
                        Fazer minha inscrição <ArrowRight size={18} />
                    </Link>
                </>
            )
        },
        photos.length > 0 && {
            id: 'fotos',
            label: 'Fotos',
            title: 'Memórias',
            subtitle: 'Momentos dos nossos retiros.',
            content: (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        {photos.map((ph, i) => (
                            <figure key={ph.url}>
                                <img src={ph.url} alt={ph.label || `Foto ${i + 1}`} loading="lazy" className="w-full aspect-[4/5] object-cover rounded-sm" />
                                <figcaption className="mt-2">
                                    <span className="text-sm text-cafe-100/90">{ph.label}</span>
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                    <Link to="/galeria" className="inline-flex items-center gap-2 mt-10 text-cafe-300 hover:text-cafe-100 underline">Ver galeria completa <ArrowRight size={16} /></Link>
                </>
            )
        },
        {
            id: 'musicas',
            label: 'Músicas',
            title: <>Na <em className="not-italic text-cafe-300">vitrola</em></>,
            subtitle: 'Ouça antes de chegar.',
            content: playlists.length ? (
                <MusicShelf embeds={playlists} />
            ) : (
                <p className="font-news italic text-2xl text-cafe-300">A playlist do retiro chega em breve.</p>
            )
        }
    ].filter(Boolean) as ScenePanel[]

    return (
        <main className="min-h-screen pb-24 text-cafe-900">
            <AnimatePresence>
                {showIntro && <Intro title={titleMain} phrases={phrases.length ? phrases : ['Preparando tudo']} onDone={endIntro} />}
            </AnimatePresence>

            <EventHeroScene
                titleMain={titleMain}
                titleYear={titleYear}
                tagline={c.tagline && <>{c.tagline.split(' ').slice(0, -1).join(' ')} <em className="text-cafe-500">{c.tagline.split(' ').slice(-1)}</em></>}
                datesText={!c.tagline && dates.length ? dates.join(' e ') : undefined}
                minAge={c.min_age}
                description={c.description}
                location={event.location}
                days={days}
                image={c.hero_image}
                eventName={event.name}
                registerUrl={canRegister ? registerUrl : undefined}
                badgeLabel={minPrice !== null ? `Inscreva-se por R$ ${minPrice}` : 'Inscreva-se'}
                panels={panels}
                photos={photos}
                info={info}
                hasPlaylist={playlists.length > 0}
                playlistEmbeds={playlists}
                delay={showIntro ? 2.2 : 0}
            />

            <div className="max-w-5xl mx-auto px-5 md:px-8 mt-16 space-y-28">
                {c.description && <p className="md:hidden text-xl text-cafe-700 leading-relaxed">{c.description}</p>}
                {/* PROGRAMAÇÃO */}
                {sections.includes('programacao') && (
                    <section id="informacoes" className="scroll-mt-32">
                        <SectionHead n={num('programacao')} total={sections.length} title="Programação" kicker={<>Dois dias, <em className="text-cafe-500">uma casa</em></>} />
                        <div className="divide-y divide-cafe-700/15">
                            {schedule.map((day, i) => (
                                <motion.div
                                    key={day.title}
                                    className="grid md:grid-cols-[18rem_1fr] gap-4 py-8"
                                    initial={{ opacity: 0, y: 40, rotateX: -12 }}
                                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                    viewport={{ once: true, amount: 0.4 }}
                                    transition={{ duration: 0.8, delay: i * 0.12 }}
                                >
                                    <div>
                                        <h3 className="font-news text-3xl text-cafe-900">{noDash(day.title)}</h3>
                                        {day.hours && <p className="text-[11px] tracking-[0.3em] uppercase text-cafe-500 mt-2">{day.hours}</p>}
                                    </div>
                                    <ul className="space-y-3">
                                        {day.items.map((item, i) => (
                                            <li key={item} className="flex gap-4 text-lg text-cafe-700">
                                                <span className="font-news italic text-cafe-300 w-6 shrink-0">{i + 1}</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ÁREA KIDS */}
                {sections.includes('criancas') && (
                    <section id="criancas" className="scroll-mt-32">
                        <SectionHead n={num('criancas')} total={sections.length} title="Crianças" kicker={<>Um espaço para os <em className="text-cafe-500">pequenos</em></>} />
                        <p className="text-xl text-cafe-700 max-w-2xl leading-relaxed">
                            {noDash(c.kids_area?.description) || 'Teremos uma área especial para os filhos dos participantes.'}
                        </p>
                    </section>
                )}

                {/* INSCRIÇÃO */}
                {sections.includes('inscricao') && (
                    <section id="inscricao" className="scroll-mt-32">
                        <SectionHead n={num('inscricao')} total={sections.length} title="Inscrição" kicker={<>Garanta <em className="text-cafe-500">sua vaga</em></>} />
                        <div className="divide-y divide-cafe-700/15 border-y border-cafe-700/15 mb-12">
                            {event.kit_options.map(kit => (
                                <Link key={kit.id} to={registerUrl} className="group flex items-center justify-between gap-6 py-6 hover:bg-cafe-300/15 transition-colors px-2">
                                    <span className="text-lg text-cafe-900">{noDash(kit.name.replace(/\s*\(R\$[^)]*\)/, ''))}</span>
                                    <span className="flex items-center gap-4">
                                        <span className="font-news text-4xl text-cafe-700">R$ {kit.price}</span>
                                        <ArrowRight className="text-cafe-500 transition-transform group-hover:translate-x-1" />
                                    </span>
                                </Link>
                            ))}
                        </div>
                        <Link
                            to={registerUrl}
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-cafe-900 text-cafe-100 font-bold uppercase tracking-[0.2em] text-sm hover:bg-cafe-700 transition-colors"
                        >
                            Fazer minha inscrição <ArrowRight size={18} />
                        </Link>
                    </section>
                )}
            </div>
        </main>
    )
}

export default EventPage
