import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Calendar, MapPin, Clock, Baby, ArrowRight, Loader2, Users } from 'lucide-react'
import { fetchActiveEvent, fetchEventBySlug } from '../services/eventService'
import { EventItem } from '../types/database'

const formatDate = (d?: string | null) =>
    d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }) : ''

// Página genérica de evento: tudo vem de events (+ events.content), editável em /admin/eventos
export const EventPage = ({ event: initial }: { event?: EventItem }) => {
    const { slug } = useParams()
    const [event, setEvent] = useState<EventItem | null>(initial || null)
    const [loading, setLoading] = useState(!initial)

    useEffect(() => {
        if (initial) return
        setLoading(true)
        ;(slug ? fetchEventBySlug(slug) : fetchActiveEvent()).then(e => {
            setEvent(e)
            setLoading(false)
        })
    }, [slug, initial])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-holi-primary" />
            </div>
        )
    }

    if (!event) {
        return (
            <div className="min-h-screen pt-32 px-4 text-center text-gray-400">
                Evento não encontrado. <Link to="/" className="text-holi-primary underline">Voltar</Link>
            </div>
        )
    }

    const c = event.content || {}
    const minPrice = event.kit_options.length ? Math.min(...event.kit_options.map(k => k.price)) : null
    const canRegister = event.status === 'active' || event.status === 'upcoming'
    const registerUrl = `/inscricao?evento=${event.slug}`
    const dates = [formatDate(event.start_date), formatDate(event.end_date)].filter(Boolean)

    return (
        <main className="min-h-screen pt-32 pb-24 px-4 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-holi-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10 space-y-16">
                {/* HERO */}
                <section id="sobre" className="text-center scroll-mt-32">
                    {c.hero_image && (
                        <img src={c.hero_image} alt={event.name} className="w-full max-h-96 object-cover rounded-3xl mb-10 border border-white/10" />
                    )}
                    {c.tagline && (
                        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-white/5 border border-white/10 text-holi-secondary mb-4">
                            {c.tagline}
                        </span>
                    )}
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white mb-6">{event.name}</h1>
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-gray-300 mb-8">
                        {dates.length > 0 && (
                            <span className="flex items-center gap-2"><Calendar size={18} className="text-holi-primary" /> {dates.join(' e ')}</span>
                        )}
                        {event.location && (
                            <span className="flex items-center gap-2"><MapPin size={18} className="text-holi-secondary" /> {event.location}</span>
                        )}
                        {c.min_age && (
                            <span className="flex items-center gap-2"><Users size={18} className="text-holi-accent" /> Inscrição para maiores de {c.min_age} anos</span>
                        )}
                    </div>
                    {c.description && <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10">{c.description}</p>}
                    {canRegister && (
                        <Link
                            to={registerUrl}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-holi-primary via-purple-600 to-holi-secondary text-white font-black text-lg uppercase tracking-wider rounded-2xl shadow-xl shadow-holi-primary/20 hover:opacity-95 transition-all"
                        >
                            Quero me inscrever {minPrice !== null && `— R$ ${minPrice},00`} <ArrowRight size={20} />
                        </Link>
                    )}
                </section>

                {/* PROGRAMAÇÃO */}
                {c.schedule && c.schedule.length > 0 && (
                    <section id="informacoes" className="scroll-mt-32">
                        <h2 className="text-xs font-black uppercase tracking-widest text-holi-accent mb-6 text-center">Programação</h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            {c.schedule.map(day => (
                                <div key={day.title} className="bg-holi-surface border border-white/10 rounded-3xl p-6">
                                    <h3 className="text-2xl font-black text-white uppercase">{day.title}</h3>
                                    {day.hours && (
                                        <p className="flex items-center gap-2 text-holi-secondary font-bold mt-1 mb-4"><Clock size={16} /> {day.hours}</p>
                                    )}
                                    <ul className="space-y-2">
                                        {day.items.map(item => (
                                            <li key={item} className="flex gap-3 text-gray-300">
                                                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-holi-primary shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ÁREA KIDS */}
                {c.kids_area?.enabled && (
                    <section className="bg-gradient-to-r from-holi-accent/10 to-holi-secondary/10 border border-holi-accent/30 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-holi-accent/20 flex items-center justify-center shrink-0">
                            <Baby size={32} className="text-holi-accent" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase mb-2">Área para as crianças</h2>
                            <p className="text-gray-300">{c.kids_area.description || 'Teremos uma área especial para os filhos dos participantes.'}</p>
                        </div>
                    </section>
                )}

                {/* INVESTIMENTO */}
                {canRegister && event.kit_options.length > 0 && (
                    <section className="text-center">
                        <h2 className="text-xs font-black uppercase tracking-widest text-holi-accent mb-6">Inscrição</h2>
                        <div className="flex flex-wrap justify-center gap-4 mb-8">
                            {event.kit_options.map(kit => (
                                <div key={kit.id} className="bg-holi-surface border border-white/10 rounded-3xl px-8 py-6">
                                    <div className="text-gray-300 text-sm font-bold mb-1">{kit.name}</div>
                                    <div className="text-4xl font-black text-holi-secondary">R$ {kit.price},00</div>
                                </div>
                            ))}
                        </div>
                        <Link to={registerUrl} className="inline-flex items-center gap-2 text-holi-primary font-bold underline">
                            Fazer minha inscrição <ArrowRight size={16} />
                        </Link>
                    </section>
                )}
            </div>
        </main>
    )
}

export default EventPage
