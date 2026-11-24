import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Plus, Save, Loader2, ExternalLink, Edit3, X } from 'lucide-react'
import { fetchEvents, saveEvent } from '../services/eventService'
import { EventItem } from '../types/database'
import { parseKits, kitsToText, parseSchedule, scheduleToText } from '../lib/eventText'

const STATUS_LABEL: Record<EventItem['status'], string> = {
    active: 'Ativo (home + inscrições)',
    upcoming: 'Em breve',
    completed: 'Encerrado',
    cancelled: 'Cancelado'
}

type Form = {
    id?: string
    slug: string
    name: string
    start_date: string
    end_date: string
    location: string
    status: EventItem['status']
    kits: string
    tagline: string
    description: string
    hero_image: string
    min_age: string
    overnight: boolean
    registration_notice: string
    kids_enabled: boolean
    kids_description: string
    schedule: string
    pix_info: EventItem['pix_info']
}

const toForm = (e?: EventItem, fallbackPix?: EventItem['pix_info']): Form => ({
    id: e?.id,
    slug: e?.slug || '',
    name: e?.name || '',
    start_date: e?.start_date || '',
    end_date: e?.end_date || '',
    location: e?.location || '',
    status: e?.status || 'upcoming',
    kits: kitsToText(e?.kit_options || []),
    tagline: e?.content?.tagline || '',
    description: e?.content?.description || '',
    hero_image: e?.content?.hero_image || '',
    min_age: e?.content?.min_age ? String(e.content.min_age) : '',
    overnight: e?.content?.overnight ?? !e,
    registration_notice: e?.content?.registration_notice || '',
    kids_enabled: e?.content?.kids_area?.enabled || false,
    kids_description: e?.content?.kids_area?.description || '',
    schedule: scheduleToText(e?.content?.schedule),
    pix_info: e?.pix_info || fallbackPix || { key: '', keyType: 'CPF', receiver: '' }
})

const slugify = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const input = 'w-full px-4 py-3 bg-[#0d0714] border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:border-holi-primary'
const label = 'block text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-2'

export const EventsAdmin = () => {
    const { userRole } = useOutletContext<{ userRole: 'admin' | 'redator' }>()
    const [events, setEvents] = useState<EventItem[]>([])
    const [form, setForm] = useState<Form | null>(null)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    const load = () => fetchEvents().then(setEvents)
    useEffect(() => { load() }, [])

    if (userRole !== 'admin') return <p className="text-gray-400">Apenas administradores podem gerenciar eventos.</p>

    const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm(f => f && { ...f, [key]: value })

    const handleSave = async () => {
        if (!form) return
        const kit_options = parseKits(form.kits)
        if (!form.name || !form.slug || !form.start_date || kit_options.length === 0) {
            setMessage('Preencha nome, endereço (slug), data de início e pelo menos uma opção de inscrição.')
            return
        }
        setSaving(true)
        setMessage(null)
        try {
            await saveEvent({
                id: form.id,
                slug: form.slug,
                name: form.name,
                year: Number(form.start_date.slice(0, 4)),
                start_date: form.start_date,
                end_date: form.end_date || null,
                location: form.location || null,
                status: form.status,
                kit_options,
                pix_info: form.pix_info,
                content: {
                    tagline: form.tagline || undefined,
                    description: form.description || undefined,
                    hero_image: form.hero_image || undefined,
                    min_age: form.min_age ? Number(form.min_age) : undefined,
                    overnight: form.overnight,
                    registration_notice: form.registration_notice || undefined,
                    kids_area: { enabled: form.kids_enabled, description: form.kids_description || undefined },
                    schedule: parseSchedule(form.schedule)
                }
            })
            setMessage('Evento salvo!')
            setForm(null)
            load()
        } catch (err: any) {
            setMessage(`Erro ao salvar: ${err.message}`)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase">Eventos / Retiros</h1>
                    <p className="text-gray-400 text-sm">Cadastre um evento e ele ganha página e inscrição sem mexer no código. O evento <strong>Ativo</strong> aparece na home.</p>
                </div>
                <button
                    onClick={() => setForm(toForm(undefined, events.find(e => e.status === 'active')?.pix_info || events[0]?.pix_info))}
                    className="inline-flex items-center gap-2 px-4 py-3 bg-holi-primary text-white font-black rounded-2xl text-xs uppercase tracking-wider"
                >
                    <Plus size={16} /> Novo evento
                </button>
            </div>

            {message && <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-white">{message}</div>}

            {form && (
                <div className="bg-holi-surface border border-white/10 rounded-3xl p-6 space-y-5">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black text-white">{form.id ? 'Editar evento' : 'Novo evento'}</h2>
                        <button onClick={() => setForm(null)} className="text-gray-400 hover:text-white" aria-label="Fechar"><X size={20} /></button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className={label}>Nome *</label>
                            <input className={input} value={form.name} placeholder="Retiro DNA 2026"
                                onChange={e => { set('name', e.target.value); if (!form.id) set('slug', slugify(e.target.value)) }} />
                        </div>
                        <div>
                            <label className={label}>Endereço da página (slug) *</label>
                            <input className={input} value={form.slug} onChange={e => set('slug', slugify(e.target.value))} />
                            <p className="text-xs text-gray-500 mt-1">/evento/{form.slug || '...'}</p>
                        </div>
                        <div>
                            <label className={label}>Data início *</label>
                            <input type="date" className={input} value={form.start_date} onChange={e => set('start_date', e.target.value)} />
                        </div>
                        <div>
                            <label className={label}>Data fim</label>
                            <input type="date" className={input} value={form.end_date} onChange={e => set('end_date', e.target.value)} />
                        </div>
                        <div>
                            <label className={label}>Local</label>
                            <input className={input} value={form.location} onChange={e => set('location', e.target.value)} />
                        </div>
                        <div>
                            <label className={label}>Status</label>
                            <select className={input} value={form.status} onChange={e => set('status', e.target.value as Form['status'])}>
                                {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={label}>Chamada curta</label>
                            <input className={input} value={form.tagline} placeholder="12 e 13 de dezembro" onChange={e => set('tagline', e.target.value)} />
                        </div>
                        <div>
                            <label className={label}>Idade mínima para se inscrever</label>
                            <input type="number" min={0} className={input} value={form.min_age} placeholder="vazio = sem limite" onChange={e => set('min_age', e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <label className={label}>Descrição</label>
                        <textarea rows={3} className={input} value={form.description} onChange={e => set('description', e.target.value)} />
                    </div>
                    <div>
                        <label className={label}>Imagem de capa (URL)</label>
                        <input className={input} value={form.hero_image} onChange={e => set('hero_image', e.target.value)} />
                    </div>

                    <div>
                        <label className={label}>Opções de inscrição * — uma por linha: Nome | valor</label>
                        <textarea rows={3} className={`${input} font-mono`} value={form.kits}
                            placeholder="Inscrição adulto (R$ 30,00) | 30" onChange={e => set('kits', e.target.value)} />
                    </div>

                    <div>
                        <label className={label}>Programação — "# Dia | horário" e depois uma atividade por linha</label>
                        <textarea rows={9} className={`${input} font-mono`} value={form.schedule}
                            placeholder={'# Sábado – 12/12 | das 14h às 20h\nPreparação da cozinha\nHot-dog\n\n# Domingo – 13/12 | das 8h às 14h\nMissa na Matriz'}
                            onChange={e => set('schedule', e.target.value)} />
                    </div>

                    <div>
                        <label className={label}>Aviso na tela de inscrição (opcional)</label>
                        <input className={input} value={form.registration_notice} onChange={e => set('registration_notice', e.target.value)} />
                    </div>

                    <label className="flex items-center gap-3 text-sm text-white">
                        <input type="checkbox" checked={form.overnight} onChange={e => set('overnight', e.target.checked)} />
                        Perguntar na inscrição se a pessoa vai pernoitar
                    </label>

                    <label className="flex items-center gap-3 text-sm text-white">
                        <input type="checkbox" checked={form.kids_enabled} onChange={e => set('kids_enabled', e.target.checked)} />
                        Tem área para crianças (permite cadastrar filhos na inscrição)
                    </label>
                    {form.kids_enabled && (
                        <div>
                            <label className={label}>Texto da área kids</label>
                            <textarea rows={2} className={input} value={form.kids_description} onChange={e => set('kids_description', e.target.value)} />
                        </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className={label}>Chave PIX</label>
                            <input className={input} value={form.pix_info.key} onChange={e => set('pix_info', { ...form.pix_info, key: e.target.value })} />
                        </div>
                        <div>
                            <label className={label}>Favorecido</label>
                            <input className={input} value={form.pix_info.receiver} onChange={e => set('pix_info', { ...form.pix_info, receiver: e.target.value })} />
                        </div>
                        <div>
                            <label className={label}>WhatsApp suporte (55DDD...)</label>
                            <input className={input} value={form.pix_info.whatsappSupport || ''} onChange={e => set('pix_info', { ...form.pix_info, whatsappSupport: e.target.value })} />
                        </div>
                    </div>

                    <button onClick={handleSave} disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-holi-primary text-white font-black rounded-2xl text-sm uppercase disabled:opacity-50">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar evento
                    </button>
                </div>
            )}

            <div className="grid gap-3">
                {events.map(e => (
                    <div key={e.id} className="flex items-center justify-between gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <div>
                            <div className="text-white font-bold">{e.name}</div>
                            <div className="text-xs text-gray-400">
                                {e.start_date} · {STATUS_LABEL[e.status]} · {e.kit_options.map(k => `R$ ${k.price}`).join(' / ')}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link to={`/evento/${e.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-white" title="Ver página"><ExternalLink size={18} /></Link>
                            <button onClick={() => setForm(toForm(e))} className="p-2 text-gray-400 hover:text-white" title="Editar"><Edit3 size={18} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default EventsAdmin
