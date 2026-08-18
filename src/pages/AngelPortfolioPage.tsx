import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users, Phone, Mail, CheckCircle, Clock, XCircle,
    ChevronDown, ChevronUp, DollarSign, Package, Shirt, TrendingUp, Sparkles, Loader2
} from 'lucide-react'
import { fetchEvents } from '../services/eventService'
import { fetchAllDetailedRegistrations } from '../services/registrationService'
import { supabase } from '../lib/supabase'
import { EventItem, RegistrationDetailed } from '../types/database'

interface AngelPortfolio {
    name: string
    registrations: RegistrationDetailed[]
    totalRevenue: number
    paidCount: number
    pendingCount: number
    canceledCount: number
}

const AngelPortfolioPage = () => {
    const { userRole } = useOutletContext<{ userRole: 'admin' | 'redator' }>()
    const [events, setEvents] = useState<EventItem[]>([])
    const [selectedEventSlug, setSelectedEventSlug] = useState<string>('adonai-2026')
    const [registrations, setRegistrations] = useState<RegistrationDetailed[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedAngel, setExpandedAngel] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const loadEvts = async () => {
            const evts = await fetchEvents()
            setEvents(evts)
            const active = evts.find(e => e.status === 'active')
            if (active) setSelectedEventSlug(active.slug)
        }
        loadEvts()
    }, [])

    useEffect(() => {
        loadRegistrations()
    }, [selectedEventSlug])

    const loadRegistrations = async () => {
        setLoading(true)
        try {
            const data = await fetchAllDetailedRegistrations(selectedEventSlug)
            if (data && data.length > 0) {
                setRegistrations(data)
            } else {
                // Fallback legada
                const { data: legacyData } = await supabase
                    .from('event_registrations')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (legacyData) {
                    const converted: RegistrationDetailed[] = legacyData.map(leg => ({
                        id: leg.id,
                        created_at: leg.created_at,
                        kit_option: leg.kit_option || 'Kit 01 - Inscrição',
                        tshirt_size: leg.tshirt_size,
                        tshirt_size_2: leg.tshirt_size_2,
                        staying_on_site: leg.staying_on_site,
                        assigned_angel: leg.assigned_angel,
                        status: leg.payment_status === 'Pago' ? 'Confirmada' : 'Pendente',
                        notes: null,
                        participant: {
                            id: leg.id,
                            full_name: leg.full_name || 'Participante',
                            email: leg.email,
                            phone: leg.phone,
                            birth_date: leg.birth_date,
                            gender: leg.gender,
                            address: leg.address,
                            city: leg.city,
                            parish: leg.parish,
                            emergency_phone: leg.emergency_phone
                        },
                        event: {
                            id: 'legacy-event',
                            slug: 'carnaval-2026',
                            name: 'Retiro de Carnaval 2026',
                            year: 2026,
                            status: 'completed',
                            kit_options: [],
                            pix_info: { key: '', keyType: '', receiver: '' }
                        },
                        payment: {
                            id: leg.id,
                            registration_id: leg.id,
                            amount: leg.payment_amount || 50,
                            status: leg.payment_status || 'Pendente',
                            payment_method: 'PIX',
                            payment_receipt_url: leg.payment_receipt_url,
                            paid_at: leg.payment_status === 'Pago' ? leg.created_at : null
                        }
                    }))

                    if (selectedEventSlug === 'all' || selectedEventSlug === 'carnaval-2026') {
                        setRegistrations(converted)
                    } else {
                        setRegistrations([])
                    }
                } else {
                    setRegistrations([])
                }
            }
        } catch (err) {
            console.error('Erro ao carregar anjos:', err)
        } finally {
            setLoading(false)
        }
    }

    const calculateAge = (birthDate?: string | null) => {
        if (!birthDate) return 'N/A'
        const birth = new Date(birthDate)
        const today = new Date()
        let age = today.getFullYear() - birth.getFullYear()
        const m = today.getMonth() - birth.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--
        }
        return isNaN(age) ? 'N/A' : age
    }

    // Agrupar por anjo
    const angelPortfolios: AngelPortfolio[] = React.useMemo(() => {
        const grouped = new Map<string, RegistrationDetailed[]>()

        registrations.forEach(reg => {
            const angelName = (reg.assigned_angel || '').trim() || 'Sem Anjo'
            if (!grouped.has(angelName)) {
                grouped.set(angelName, [])
            }
            grouped.get(angelName)!.push(reg)
        })

        const portfolios: AngelPortfolio[] = []
        grouped.forEach((regs, name) => {
            const paidCount = regs.filter(r => r.payment?.status === 'Pago').length
            const pendingCount = regs.filter(r => r.payment?.status === 'Pendente').length
            const canceledCount = regs.filter(r => r.payment?.status === 'Cancelado').length
            const totalRevenue = regs
                .filter(r => r.payment?.status !== 'Cancelado')
                .reduce((sum, r) => sum + (Number(r.payment?.amount) || 0), 0)

            portfolios.push({
                name,
                registrations: regs,
                totalRevenue,
                paidCount,
                pendingCount,
                canceledCount
            })
        })

        // Ordenar com 'Sem Anjo' por último
        return portfolios.sort((a, b) => {
            if (a.name === 'Sem Anjo') return 1
            if (b.name === 'Sem Anjo') return -1
            return a.name.localeCompare(b.name)
        })
    }, [registrations])

    const filteredPortfolios = angelPortfolios.filter(portfolio =>
        portfolio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        portfolio.registrations.some(r =>
            r.participant.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.participant.email || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
    )

    const grandTotalRevenue = angelPortfolios.reduce((sum, p) => sum + p.totalRevenue, 0)
    const grandTotalPaid = angelPortfolios.reduce((sum, p) => sum + p.paidCount, 0)
    const grandTotalPending = angelPortfolios.reduce((sum, p) => sum + p.pendingCount, 0)

    return (
        <div className="space-y-8">
            {/* CABEÇALHO & SELETOR DE EVENTO */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-holi-surface/80 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
                            Carteira de Anjos
                        </h1>
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-bold uppercase">
                            Acompanhamento
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                        Acompanhe os participantes distribuídos por anjo/padrinho neste retiro.
                    </p>
                </div>

                {/* SELETOR DE RETIRO */}
                <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10 overflow-x-auto">
                    {events.map(evt => (
                        <button
                            key={evt.slug}
                            onClick={() => setSelectedEventSlug(evt.slug)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                selectedEventSlug === evt.slug
                                    ? 'bg-gradient-to-r from-holi-primary to-purple-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {evt.status === 'active' && <Sparkles size={12} className="text-holi-accent" />}
                            {evt.name.replace('Retiro de ', '').replace('Retiro ', '')}
                        </button>
                    ))}
                    <button
                        onClick={() => setSelectedEventSlug('all')}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                            selectedEventSlug === 'all'
                                ? 'bg-white text-black shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        Todos
                    </button>
                </div>
            </div>

            {/* CARDS DE RESUMO */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-holi-surface border border-white/10 p-5 rounded-2xl">
                    <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Anjos Ativos</span>
                    <div className="text-3xl font-black text-white">
                        {angelPortfolios.filter(p => p.name !== 'Sem Anjo').length}
                    </div>
                    <span className="text-[11px] text-gray-400 mt-1 block">Equipe de acolhimento</span>
                </div>

                <div className="bg-holi-surface border border-white/10 p-5 rounded-2xl">
                    <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Participantes</span>
                    <div className="text-3xl font-black text-holi-primary">{registrations.length}</div>
                    <span className="text-[11px] text-gray-400 mt-1 block">Total neste retiro</span>
                </div>

                <div className="bg-holi-surface border border-white/10 p-5 rounded-2xl">
                    <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Confirmados</span>
                    <div className="text-3xl font-black text-green-400">{grandTotalPaid}</div>
                    <span className="text-[11px] text-gray-400 mt-1 block">Pagos e validados</span>
                </div>

                <div className="bg-holi-surface border border-white/10 p-5 rounded-2xl">
                    <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Pendentes</span>
                    <div className="text-3xl font-black text-amber-400">{grandTotalPending}</div>
                    <span className="text-[11px] text-gray-400 mt-1 block">Aguardando PIX</span>
                </div>
            </div>

            {/* BUSCA */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Buscar por anjo ou participante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-4 pr-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-holi-primary"
                />
            </div>

            {/* LISTAGEM DE CARTEIRAS POR ANJO */}
            {loading ? (
                <div className="py-20 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-holi-primary mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Carregando anjos...</p>
                </div>
            ) : filteredPortfolios.length === 0 ? (
                <div className="py-20 text-center text-gray-400 bg-holi-surface border border-white/10 rounded-3xl">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-lg font-bold text-white mb-1">Nenhum registro encontrado</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredPortfolios.map(portfolio => {
                        const isExpanded = expandedAngel === portfolio.name
                        const isNoAngel = portfolio.name === 'Sem Anjo'

                        return (
                            <div
                                key={portfolio.name}
                                className={`bg-holi-surface border rounded-3xl overflow-hidden transition-all ${
                                    isNoAngel ? 'border-amber-500/20' : 'border-white/10'
                                }`}
                            >
                                <div
                                    onClick={() => setExpandedAngel(isExpanded ? null : portfolio.name)}
                                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm border ${
                                                isNoAngel
                                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                                    : 'bg-holi-primary/20 border-holi-primary/30 text-holi-primary'
                                            }`}
                                        >
                                            {isNoAngel ? '!' : portfolio.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-base flex items-center gap-2">
                                                {portfolio.name}
                                                {isNoAngel && (
                                                    <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                                                        Necessita Atribuição
                                                    </span>
                                                )}
                                            </h3>
                                            <span className="text-xs text-gray-400">
                                                {portfolio.registrations.length} participantes • {portfolio.paidCount} confirmados
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <span className="text-xs text-gray-500 block">Total</span>
                                            <span className="text-sm font-black text-holi-secondary">
                                                R$ {portfolio.totalRevenue},00
                                            </span>
                                        </div>
                                        {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="border-t border-white/5 bg-black/20 p-5 space-y-3">
                                        {portfolio.registrations.map(reg => (
                                            <div
                                                key={reg.id}
                                                className="p-4 bg-holi-surface/80 border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                            >
                                                <div>
                                                    <div className="font-bold text-white text-sm">
                                                        {reg.participant.full_name}
                                                    </div>
                                                    <div className="text-xs text-gray-400 flex flex-wrap gap-3 mt-1">
                                                        {reg.participant.phone && (
                                                            <span className="flex items-center gap-1">
                                                                <Phone size={12} /> {reg.participant.phone}
                                                            </span>
                                                        )}
                                                        {reg.participant.parish && (
                                                            <span>• {reg.participant.parish}</span>
                                                        )}
                                                        <span>• {reg.kit_option.split(' - ')[0]}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                            reg.payment?.status === 'Pago'
                                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                        }`}
                                                    >
                                                        {reg.payment?.status || 'Pendente'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default AngelPortfolioPage
