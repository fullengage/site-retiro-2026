import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users, Phone, Mail, CheckCircle, Clock, XCircle,
    ChevronDown, ChevronUp, DollarSign, Package, Shirt, TrendingUp,
    Sparkles, Loader2, Download, FileSpreadsheet
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
    const [selectedEventSlug, setSelectedEventSlug] = useState<string>('all')
    const [registrations, setRegistrations] = useState<RegistrationDetailed[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedAngel, setExpandedAngel] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const loadEvts = async () => {
            const evts = await fetchEvents()
            setEvents(evts)
            // Se tiver eventos, default para 'all' ou o ativo
            setSelectedEventSlug('all')
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

                if (legacyData && legacyData.length > 0) {
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
                        // Se o evento novo ainda não tiver inscrições, exibe todas para facilitar o gerenciamento dos anjos
                        setRegistrations(converted)
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

    // Exportação para Planilha CSV compatível com Excel (BOM UTF-8 e delimitador ;)
    const handleExportSpreadsheet = () => {
        if (!registrations || registrations.length === 0) {
            alert('Nenhuma inscrição encontrada para exportar.')
            return
        }

        const headers = [
            'Anjo Responsável',
            'Nome Completo',
            'WhatsApp / Telefone',
            'Email',
            'Data de Nascimento',
            'Idade',
            'Gênero',
            'Cidade',
            'Paróquia',
            'Contato Emergência',
            'Pernoite (Camping)',
            'Kit / Inscrição',
            'Tamanho Camiseta 1',
            'Tamanho Camiseta 2',
            'Status Pagamento',
            'Valor (R$)',
            'Data de Inscrição'
        ]

        const escapeCsv = (val: any) => {
            if (val === null || val === undefined) return '""'
            const str = String(val).replace(/"/g, '""')
            return `"${str}"`
        }

        const rows = [headers.map(escapeCsv).join(';')]

        // Ordenar por anjo e nome do participante
        const sorted = [...registrations].sort((a, b) => {
            const angelA = (a.assigned_angel || '').trim() || 'Sem Anjo'
            const angelB = (b.assigned_angel || '').trim() || 'Sem Anjo'
            if (angelA === angelB) {
                return (a.participant.full_name || '').localeCompare(b.participant.full_name || '')
            }
            if (angelA === 'Sem Anjo') return 1
            if (angelB === 'Sem Anjo') return -1
            return angelA.localeCompare(angelB)
        })

        sorted.forEach(r => {
            const age = calculateAge(r.participant.birth_date)
            const createdAtFormatted = r.created_at ? new Date(r.created_at).toLocaleString('pt-BR') : ''
            const row = [
                (r.assigned_angel || '').trim() || 'Sem Anjo',
                r.participant.full_name || '',
                r.participant.phone || '',
                r.participant.email || '',
                r.participant.birth_date || '',
                age,
                r.participant.gender || '',
                r.participant.city || '',
                r.participant.parish || '',
                r.participant.emergency_phone || '',
                r.staying_on_site ? 'Sim' : 'Não',
                r.kit_option || '',
                r.tshirt_size || '',
                r.tshirt_size_2 || '',
                r.payment?.status || r.status || 'Pendente',
                r.payment?.amount ? String(r.payment.amount) : '0',
                createdAtFormatted
            ]
            rows.push(row.map(escapeCsv).join(';'))
        })

        // Adiciona UTF-8 BOM (\uFEFF) para abrir perfeitamente com acentos no Excel
        const bom = '\uFEFF'
        const csvContent = bom + rows.join('\r\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        const filename = `relatorio_carteira_de_anjos_${selectedEventSlug}_${new Date().toISOString().slice(0, 10)}.csv`
        link.setAttribute('href', url)
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
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
            {/* CABEÇALHO & SELETOR DE EVENTO & BOTÃO DOWNLOAD */}
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

                <div className="flex flex-wrap items-center gap-3">
                    {/* BOTÃO BAIXAR PLANILHA */}
                    <button
                        onClick={handleExportSpreadsheet}
                        disabled={loading || registrations.length === 0}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black rounded-2xl transition-all shadow-lg shadow-emerald-500/20 text-xs uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Baixar lista completa em formato de planilha Excel / CSV"
                    >
                        <FileSpreadsheet size={18} />
                        <span>Baixar Planilha ({registrations.length})</span>
                        <Download size={16} />
                    </button>

                    {/* SELETOR DE RETIRO */}
                    <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10 overflow-x-auto">
                        <button
                            onClick={() => setSelectedEventSlug('all')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                                selectedEventSlug === 'all'
                                    ? 'bg-white text-black shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            Todos ({registrations.length})
                        </button>
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
                    </div>
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
                                            {portfolio.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-white text-lg">{portfolio.name}</h3>
                                                {isNoAngel && (
                                                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase rounded-full">
                                                        Atenção
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                {portfolio.registrations.length} participante(s) sob sua responsabilidade
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="hidden sm:flex items-center gap-3 font-mono text-xs">
                                            <span className="px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full font-bold">
                                                {portfolio.paidCount} Pagos
                                            </span>
                                            {portfolio.pendingCount > 0 && (
                                                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-bold">
                                                    {portfolio.pendingCount} Pendentes
                                                </span>
                                            )}
                                            <span className="text-gray-300 font-black">
                                                R$ {portfolio.totalRevenue.toLocaleString('pt-BR')}
                                            </span>
                                        </div>

                                        <button className="text-gray-400 hover:text-white p-2">
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {/* LISTA DE PARTICIPANTES DO ANJO */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-white/5 bg-black/20 p-5 space-y-3"
                                        >
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-xs">
                                                    <thead>
                                                        <tr className="text-gray-500 border-b border-white/10 uppercase tracking-wider font-mono">
                                                            <th className="pb-3 font-bold">Participante</th>
                                                            <th className="pb-3 font-bold">Contato</th>
                                                            <th className="pb-3 font-bold">Idade / Cidade</th>
                                                            <th className="pb-3 font-bold">Kit / Camiseta</th>
                                                            <th className="pb-3 font-bold">Status PIX</th>
                                                            <th className="pb-3 font-bold text-right">Valor</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {portfolio.registrations.map(reg => {
                                                            const isPaid = reg.payment?.status === 'Pago' || reg.status === 'Confirmada'
                                                            const age = calculateAge(reg.participant.birth_date)

                                                            return (
                                                                <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                                                                    <td className="py-3 font-bold text-white">
                                                                        {reg.participant.full_name}
                                                                        {reg.staying_on_site && (
                                                                            <span className="ml-2 px-1.5 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] rounded">
                                                                                Camping
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="py-3 font-mono text-gray-300">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <Phone size={12} className="text-holi-secondary" />
                                                                            <a
                                                                                href={`https://wa.me/55${(reg.participant.phone || '').replace(/\D/g, '')}`}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="hover:underline hover:text-holi-secondary"
                                                                            >
                                                                                {reg.participant.phone || 'Sem fone'}
                                                                            </a>
                                                                        </div>
                                                                        {reg.participant.email && (
                                                                            <div className="text-[11px] text-gray-500 truncate max-w-[160px]">
                                                                                {reg.participant.email}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td className="py-3 text-gray-400">
                                                                        <div>{age} anos</div>
                                                                        <div className="text-[11px] text-gray-500">{reg.participant.city || 'N/D'}</div>
                                                                    </td>
                                                                    <td className="py-3 text-gray-300">
                                                                        <div className="truncate max-w-[180px]">{reg.kit_option}</div>
                                                                        {(reg.tshirt_size || reg.tshirt_size_2) && (
                                                                            <span className="text-[11px] text-holi-accent flex items-center gap-1 mt-0.5">
                                                                                <Shirt size={10} />
                                                                                Tam: {[reg.tshirt_size, reg.tshirt_size_2].filter(Boolean).join(', ')}
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="py-3 font-mono">
                                                                        {isPaid ? (
                                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full font-bold">
                                                                                <CheckCircle size={12} /> Pago
                                                                            </span>
                                                                        ) : (
                                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-bold">
                                                                                <Clock size={12} /> Pendente
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="py-3 text-right font-mono font-black text-white">
                                                                        R$ {reg.payment?.amount || 50}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default AngelPortfolioPage
