import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Download, Users, CheckCircle,
    Shirt, UserCheck, History,
    X, Trash2, ChevronRight, Package, Activity, Loader2, Upload, ChevronDown,
    Calendar, CreditCard, Sparkles, Eye, Phone, Mail, MapPin, Check, AlertCircle, FileCheck
} from 'lucide-react'
import { fetchEvents } from '../services/eventService'
import { fetchAllDetailedRegistrations, updatePaymentAndRegistrationStatus, updateRegistrationAngel, deleteRegistrationCascade } from '../services/registrationService'
import { fetchParticipantHistory } from '../services/participantService'
import { supabase } from '../lib/supabase'
import { EventItem, RegistrationDetailed, ParticipantHistoryItem } from '../types/database'

const RegistrationAdmin = () => {
    const { userRole } = useOutletContext<{ userRole: 'admin' | 'redator' }>()

    const [events, setEvents] = useState<EventItem[]>([])
    const [selectedEventSlug, setSelectedEventSlug] = useState<string>('adonai-2026')
    const [registrations, setRegistrations] = useState<RegistrationDetailed[]>([])
    const [loading, setLoading] = useState(true)

    // Filtros e Abas
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('Todos')
    const [filterAngel, setFilterAngel] = useState('Todos')
    const [activeTab, setActiveTab] = useState<'list' | 'dashboard'>('list')

    // Modal de Edição / Detalhes
    const [editingReg, setEditingReg] = useState<RegistrationDetailed | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [uploadingReceipt, setUploadingReceipt] = useState(false)

    // Modal de Histórico 360° do Participante
    const [historyModalParticipant, setHistoryModalParticipant] = useState<{ id: string; name: string; email?: string | null; phone?: string | null } | null>(null)
    const [participantHistory, setParticipantHistory] = useState<ParticipantHistoryItem[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)

    // Carregar eventos ao inicializar
    useEffect(() => {
        const loadEventsList = async () => {
            const evts = await fetchEvents()
            setEvents(evts)
            // Se houver um evento ativo, seleciona ele por padrão
            const active = evts.find(e => e.status === 'active')
            if (active) setSelectedEventSlug(active.slug)
        }
        loadEventsList()
    }, [])

    // Carregar inscrições sempre que o evento selecionado mudar
    useEffect(() => {
        loadRegistrations()
    }, [selectedEventSlug])

    const loadRegistrations = async () => {
        setLoading(true)
        try {
            // Tenta buscar no modelo normalizado
            const data = await fetchAllDetailedRegistrations(selectedEventSlug)
            if (data && data.length > 0) {
                setRegistrations(data)
            } else {
                // Fallback para tabela legada event_registrations caso ainda não tenha rodado a migration
                const { data: legacyData, error: legacyError } = await supabase
                    .from('event_registrations')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (!legacyError && legacyData) {
                    // Converter dados legados para o formato detalhado
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
            console.error('Erro ao carregar inscrições:', err)
        } finally {
            setLoading(false)
        }
    }

    const openParticipantHistory = async (participant: { id: string; name: string; email?: string | null; phone?: string | null }) => {
        setHistoryModalParticipant(participant)
        setLoadingHistory(true)
        try {
            const history = await fetchParticipantHistory(participant.id)
            setParticipantHistory(history)
        } catch (err) {
            console.error('Erro ao buscar histórico do participante:', err)
        } finally {
            setLoadingHistory(false)
        }
    }

    const handleTogglePaymentStatus = async (reg: RegistrationDetailed) => {
        const nextStatus = reg.payment?.status === 'Pago' ? 'Pendente' : 'Pago'
        try {
            await updatePaymentAndRegistrationStatus({
                registrationId: reg.id,
                paymentId: reg.payment?.id,
                newPaymentStatus: nextStatus
            })

            // Atualização otimista
            setRegistrations(prev => prev.map(r => {
                if (r.id === reg.id) {
                    return {
                        ...r,
                        status: nextStatus === 'Pago' ? 'Confirmada' : 'Pendente',
                        payment: r.payment ? { ...r.payment, status: nextStatus } : null
                    }
                }
                return r
            }))
        } catch (err: any) {
            alert('Erro ao atualizar status: ' + err.message)
        }
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('Esta ação removerá permanentemente a inscrição e seu pagamento. Deseja continuar?')) return

        setDeletingId(id)
        try {
            await deleteRegistrationCascade(id)
            setRegistrations(prev => prev.filter(r => r.id !== id))
        } catch (err: any) {
            // Fallback caso seja tabela legada
            await supabase.from('event_registrations').delete().eq('id', id)
            setRegistrations(prev => prev.filter(r => r.id !== id))
        } finally {
            setDeletingId(null)
        }
    }

    const handleAdminReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !editingReg) return

        const file = e.target.files[0]
        if (file.size > 10 * 1024 * 1024) {
            alert('O arquivo deve ter no máximo 10MB')
            return
        }

        setUploadingReceipt(true)

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${editingReg.event.slug || 'comprovantes'}/${Date.now()}_admin.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('pagamentos')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('pagamentos')
                .getPublicUrl(fileName)

            if (editingReg.payment?.id) {
                await supabase
                    .from('payments')
                    .update({ payment_receipt_url: publicUrl })
                    .eq('id', editingReg.payment.id)
            }

            setEditingReg({
                ...editingReg,
                payment: editingReg.payment ? { ...editingReg.payment, payment_receipt_url: publicUrl } : null
            })

            loadRegistrations()
        } catch (err: any) {
            console.error('Upload error:', err)
            alert(err.message || 'Erro ao enviar comprovante')
        } finally {
            setUploadingReceipt(false)
        }
    }

    const uniqueAngels = Array.from(new Set(registrations.map(r => r.assigned_angel?.trim()).filter(Boolean))).sort()

    const filtered = registrations.filter(reg => {
        const lowerSearch = searchTerm.toLowerCase().trim()
        const matchesSearch =
            reg.participant.full_name.toLowerCase().includes(lowerSearch) ||
            (reg.participant.email || '').toLowerCase().includes(lowerSearch) ||
            (reg.participant.phone || '').includes(lowerSearch) ||
            (reg.assigned_angel || '').toLowerCase().includes(lowerSearch)

        const matchesStatus = filterStatus === 'Todos' || (reg.payment?.status || 'Pendente') === filterStatus

        const normalizedAssignedAngel = (reg.assigned_angel || '').trim()
        const normalizedFilterAngel = filterAngel.trim()

        const matchesAngel = normalizedFilterAngel === 'Todos'
            ? true
            : normalizedFilterAngel === 'Sem Anjo'
                ? normalizedAssignedAngel === ''
                : normalizedAssignedAngel === normalizedFilterAngel

        return matchesSearch && matchesStatus && matchesAngel
    })

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

    const getDetailedStats = () => {
        const kits: Record<string, number> = {}
        const tshirts: Record<string, number> = {}
        let totalTshirts = 0
        let totalRevenue = 0
        let maleCount = 0
        let femaleCount = 0
        let stayingOnSiteCount = 0
        let paidCount = 0
        let pendingCount = 0

        filtered.forEach(reg => {
            if (reg.payment?.status === 'Cancelado') return

            const kitName = reg.kit_option ? reg.kit_option.split(' - ')[0] : 'Sem Kit'
            kits[kitName] = (kits[kitName] || 0) + 1

            if (reg.payment?.status === 'Pago') {
                totalRevenue += Number(reg.payment?.amount || 0)
                paidCount++
            } else {
                pendingCount++
            }

            if (reg.tshirt_size) {
                tshirts[reg.tshirt_size] = (tshirts[reg.tshirt_size] || 0) + 1
                totalTshirts++
            }
            if (reg.tshirt_size_2) {
                tshirts[reg.tshirt_size_2] = (tshirts[reg.tshirt_size_2] || 0) + 1
                totalTshirts++
            }

            if (reg.participant.gender === 'Masculino') maleCount++
            else if (reg.participant.gender === 'Feminino') femaleCount++

            if (reg.staying_on_site) stayingOnSiteCount++
        })

        const sizeOrder = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'G1', 'G2', 'G3']
        const sortedTshirts = Object.entries(tshirts).sort((a: [string, number], b: [string, number]) => {
            const idxA = sizeOrder.indexOf(a[0])
            const idxB = sizeOrder.indexOf(b[0])
            if (idxA !== -1 && idxB !== -1) return idxA - idxB
            return a[0].localeCompare(b[0])
        })

        return {
            totalRegistrations: filtered.length,
            paidCount,
            pendingCount,
            totalRevenue,
            totalTshirts,
            maleCount,
            femaleCount,
            stayingOnSiteCount,
            kits,
            sortedTshirts
        }
    }

    const stats = getDetailedStats()

    const exportToCSV = () => {
        const headers = [
            'ID Inscrição',
            'Retiro',
            'Nome Completo',
            'Email',
            'Telefone',
            'Idade',
            'Gênero',
            'Cidade',
            'Paróquia',
            'Contato Emergência',
            'Endereço',
            'Kit',
            'Camiseta 1',
            'Camiseta 2',
            'Pernoite',
            'Status Pagamento',
            'Valor (R$)',
            'Anjo Responsável',
            'Data Inscrição',
            'Comprovante URL'
        ]

        const rows = filtered.map(r => [
            `"${r.id}"`,
            `"${r.event.name || selectedEventSlug}"`,
            `"${r.participant.full_name}"`,
            `"${r.participant.email || ''}"`,
            `"${r.participant.phone || ''}"`,
            `"${calculateAge(r.participant.birth_date)}"`,
            `"${r.participant.gender || ''}"`,
            `"${r.participant.city || ''}"`,
            `"${r.participant.parish || ''}"`,
            `"${r.participant.emergency_phone || ''}"`,
            `"${r.participant.address || ''}"`,
            `"${r.kit_option}"`,
            `"${r.tshirt_size || ''}"`,
            `"${r.tshirt_size_2 || ''}"`,
            `"${r.staying_on_site ? 'Sim' : 'Não'}"`,
            `"${r.payment?.status || 'Pendente'}"`,
            `"${r.payment?.amount || 0}"`,
            `"${r.assigned_angel || 'Não atribuído'}"`,
            `"${new Date(r.created_at).toLocaleDateString('pt-BR')}"`,
            `"${r.payment?.payment_receipt_url || ''}"`
        ])

        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', `inscricoes_${selectedEventSlug}_${new Date().toISOString().slice(0, 10)}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="space-y-8">
            {/* CABEÇALHO & SELETOR DE EVENTO */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-holi-surface/80 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
                            Gestão de Inscrições
                        </h1>
                        <span className="px-3 py-1 bg-holi-primary/20 text-holi-primary border border-holi-primary/30 rounded-full text-xs font-bold uppercase">
                            Multi-Retiros
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                        Acompanhe participantes, pagamentos, histórico de retiros e atribuição de anjos.
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
                                    ? 'bg-gradient-to-r from-holi-primary to-purple-600 text-white shadow-lg shadow-holi-primary/30'
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
                        Todos os Retiros
                    </button>
                </div>
            </div>

            {/* CARDS DE RESUMO DO RETIRO SELECIONADO */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-holi-surface border border-white/10 p-5 rounded-2xl">
                    <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Inscrições</span>
                    <div className="text-3xl font-black text-white">{stats.totalRegistrations}</div>
                    <span className="text-[11px] text-gray-400 mt-1 block">Neste filtro</span>
                </div>

                <div className="bg-holi-surface border border-white/10 p-5 rounded-2xl">
                    <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Pagamentos Confirmados</span>
                    <div className="text-3xl font-black text-green-400">{stats.paidCount}</div>
                    <span className="text-[11px] text-gray-400 mt-1 block">Total R$ {stats.totalRevenue},00</span>
                </div>

                <div className="bg-holi-surface border border-white/10 p-5 rounded-2xl">
                    <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Pendentes de PIX</span>
                    <div className="text-3xl font-black text-amber-400">{stats.pendingCount}</div>
                    <span className="text-[11px] text-gray-400 mt-1 block">Aguardando comprovante</span>
                </div>

                <div className="bg-holi-surface border border-white/10 p-5 rounded-2xl">
                    <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Camisetas Pedidas</span>
                    <div className="text-3xl font-black text-holi-secondary">{stats.totalTshirts}</div>
                    <span className="text-[11px] text-gray-400 mt-1 block">Total para confecção</span>
                </div>
            </div>

            {/* BARRA DE FERRAMENTAS & FILTROS */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-holi-surface/50 p-4 border border-white/5 rounded-2xl">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                    {/* Busca */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome, e-mail, telefone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-holi-primary"
                        />
                    </div>

                    {/* Filtro Status */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-black/40 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-holi-primary"
                    >
                        <option value="Todos">Status: Todos</option>
                        <option value="Pago">Apenas Pagos</option>
                        <option value="Pendente">Apenas Pendentes</option>
                    </select>

                    {/* Filtro Anjo */}
                    <select
                        value={filterAngel}
                        onChange={(e) => setFilterAngel(e.target.value)}
                        className="bg-black/40 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-holi-primary"
                    >
                        <option value="Todos">Anjos: Todos</option>
                        <option value="Sem Anjo">Sem Anjo Definido</option>
                        {uniqueAngels.map(angel => (
                            <option key={angel} value={angel}>{angel}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={exportToCSV}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2"
                    >
                        <Download size={16} /> Exportar CSV
                    </button>

                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                activeTab === 'list' ? 'bg-holi-primary text-white' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Lista
                        </button>
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                activeTab === 'dashboard' ? 'bg-holi-primary text-white' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Métricas
                        </button>
                    </div>
                </div>
            </div>

            {/* TAB: LISTAGEM DE INSCRIÇÕES */}
            {activeTab === 'list' && (
                <div className="bg-holi-surface border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                    {loading ? (
                        <div className="py-20 text-center">
                            <Loader2 className="w-10 h-10 animate-spin text-holi-primary mx-auto mb-3" />
                            <p className="text-gray-400 text-sm">Carregando inscrições...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-20 text-center text-gray-400">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-lg font-bold text-white mb-1">Nenhuma inscrição encontrada</p>
                            <p className="text-sm">Não há participantes cadastrados para este filtro.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 bg-black/30 text-[11px] uppercase tracking-wider text-gray-400">
                                        <th className="py-4 px-6">Participante</th>
                                        <th className="py-4 px-4">Retiro</th>
                                        <th className="py-4 px-4">Contato / Paróquia</th>
                                        <th className="py-4 px-4">Kit / Camiseta</th>
                                        <th className="py-4 px-4">Pagamento</th>
                                        <th className="py-4 px-4">Anjo</th>
                                        <th className="py-4 px-6 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {filtered.map(reg => (
                                        <tr
                                            key={reg.id}
                                            className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                            onClick={() => setEditingReg(reg)}
                                        >
                                            {/* PARTICIPANTE */}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-holi-primary/30 to-purple-600/30 border border-white/10 flex items-center justify-center text-white font-black text-sm">
                                                        {reg.participant.full_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white flex items-center gap-2">
                                                            {reg.participant.full_name}
                                                            {/* Botão para abrir histórico do participante */}
                                                            <button
                                                                type="button"
                                                                title="Ver Histórico 360° do Participante"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    openParticipantHistory({
                                                                        id: reg.participant.id,
                                                                        name: reg.participant.full_name,
                                                                        email: reg.participant.email,
                                                                        phone: reg.participant.phone
                                                                    })
                                                                }}
                                                                className="p-1 rounded-md bg-white/5 hover:bg-holi-primary/20 text-gray-400 hover:text-holi-accent transition-colors"
                                                            >
                                                                <History size={14} />
                                                            </button>
                                                        </div>
                                                        <span className="text-xs text-gray-500">
                                                            {calculateAge(reg.participant.birth_date)} anos • {reg.participant.gender || 'Não informado'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* RETIRO */}
                                            <td className="py-4 px-4">
                                                <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-white/5 border border-white/10 text-gray-300">
                                                    {reg.event.name ? reg.event.name.replace('Retiro ', '') : selectedEventSlug}
                                                </span>
                                            </td>

                                            {/* CONTATO */}
                                            <td className="py-4 px-4">
                                                <div className="text-xs space-y-0.5">
                                                    <div className="text-gray-300">{reg.participant.phone || 'Sem telefone'}</div>
                                                    <div className="text-gray-500 truncate max-w-[160px]">{reg.participant.parish || 'Paróquia não informada'}</div>
                                                </div>
                                            </td>

                                            {/* KIT & CAMISETA */}
                                            <td className="py-4 px-4">
                                                <div className="text-xs">
                                                    <span className="font-semibold text-white block">{reg.kit_option.split(' - ')[0]}</span>
                                                    {(reg.tshirt_size || reg.tshirt_size_2) && (
                                                        <span className="text-holi-secondary font-mono text-[11px] flex items-center gap-1 mt-0.5">
                                                            <Shirt size={12} />
                                                            {reg.tshirt_size} {reg.tshirt_size_2 ? `+ ${reg.tshirt_size_2}` : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* PAGAMENTO */}
                                            <td className="py-4 px-4">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleTogglePaymentStatus(reg)
                                                    }}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                                        reg.payment?.status === 'Pago'
                                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                                                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
                                                    }`}
                                                >
                                                    {reg.payment?.status === 'Pago' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                                    {reg.payment?.status || 'Pendente'}
                                                </button>
                                                {reg.payment?.payment_receipt_url && (
                                                    <a
                                                        href={reg.payment.payment_receipt_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="block text-[11px] text-holi-secondary hover:underline mt-1"
                                                    >
                                                        Ver Comprovante
                                                    </a>
                                                )}
                                            </td>

                                            {/* ANJO */}
                                            <td className="py-4 px-4">
                                                <span className={`text-xs font-medium ${reg.assigned_angel ? 'text-purple-300' : 'text-gray-600 italic'}`}>
                                                    {reg.assigned_angel || 'Sem anjo'}
                                                </span>
                                            </td>

                                            {/* AÇÕES */}
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleDelete(reg.id, e)}
                                                        disabled={deletingId === reg.id}
                                                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                        title="Excluir Inscrição"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <ChevronRight size={18} className="text-gray-500 group-hover:text-white transition-colors" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TAB: DASHBOARD & MÉTRICAS DETALHADAS */}
            {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Grade de Camisetas */}
                    <div className="bg-holi-surface border border-white/10 p-6 rounded-3xl">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Shirt className="text-holi-secondary" size={20} /> Distribuição de Camisetas
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {stats.sortedTshirts.map(([size, count]) => (
                                <div key={size} className="bg-black/40 border border-white/10 p-3 rounded-2xl text-center">
                                    <span className="text-gray-400 text-xs font-mono block">Tam {size}</span>
                                    <span className="text-xl font-black text-white">{count}</span>
                                </div>
                            ))}
                        </div>
                        {stats.sortedTshirts.length === 0 && (
                            <p className="text-gray-500 text-sm italic">Nenhum tamanho registrado ainda.</p>
                        )}
                    </div>

                    {/* Grade de Kits */}
                    <div className="bg-holi-surface border border-white/10 p-6 rounded-3xl">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Package className="text-holi-primary" size={20} /> Inscrições por Kit
                        </h3>
                        <div className="space-y-3">
                            {Object.entries(stats.kits).map(([kit, count]) => (
                                <div key={kit} className="flex justify-between items-center bg-black/40 border border-white/10 p-3.5 rounded-2xl">
                                    <span className="text-sm font-bold text-white">{kit}</span>
                                    <span className="text-sm font-black text-holi-secondary px-3 py-1 bg-holi-secondary/10 rounded-xl border border-holi-secondary/20">
                                        {count} participantes
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Acomodação e Gênero */}
                    <div className="bg-holi-surface border border-white/10 p-6 rounded-3xl">
                        <h3 className="text-lg font-bold text-white mb-4">Alojamento & Gênero</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-300">Pernoitam no Retiro (Alojados)</span>
                                <span className="font-bold text-white">{stats.stayingOnSiteCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-300">Masculino</span>
                                <span className="font-bold text-white">{stats.maleCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-300">Feminino</span>
                                <span className="font-bold text-white">{stats.femaleCount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 360° HISTÓRICO DO PARTICIPANTE */}
            <AnimatePresence>
                {historyModalParticipant && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-holi-surface border border-white/10 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative"
                        >
                            <button
                                onClick={() => setHistoryModalParticipant(null)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-holi-primary/20 border border-holi-primary/30 flex items-center justify-center text-holi-primary font-black text-xl">
                                    <History size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white">
                                        Histórico de Retiros
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        {historyModalParticipant.name}
                                    </p>
                                </div>
                            </div>

                            {loadingHistory ? (
                                <div className="py-12 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-holi-primary mx-auto mb-2" />
                                    <p className="text-xs text-gray-400">Carregando participações...</p>
                                </div>
                            ) : participantHistory.length === 0 ? (
                                <div className="py-10 text-center text-gray-500">
                                    <p className="text-sm font-bold text-gray-300">Nenhum histórico anterior registrado.</p>
                                    <p className="text-xs mt-1">Este participante está inscrito apenas na edição atual.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                                    {participantHistory.map((item, idx) => (
                                        <div
                                            key={item.registrationId || idx}
                                            className="p-4 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-between"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-white text-sm">{item.eventName}</span>
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-mono">
                                                        {item.eventYear}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-400 block mt-1">
                                                    {item.kitOption} {item.tshirtSize ? `• Tam ${item.tshirtSize}` : ''}
                                                </span>
                                            </div>

                                            <div className="text-right">
                                                <span
                                                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                                                        item.payment?.status === 'Pago'
                                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                    }`}
                                                >
                                                    {item.payment?.status || 'Pendente'}
                                                </span>
                                                {item.payment?.amount && (
                                                    <span className="text-xs text-gray-400 block mt-1">
                                                        R$ {item.payment.amount},00
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-6 pt-4 border-t border-white/10 text-right">
                                <button
                                    onClick={() => setHistoryModalParticipant(null)}
                                    className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase"
                                >
                                    Fechar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL DE DETALHES / EDIÇÃO DA INSCRIÇÃO */}
            <AnimatePresence>
                {editingReg && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-holi-surface border border-white/10 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto relative"
                        >
                            <button
                                onClick={() => setEditingReg(null)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10"
                            >
                                <X size={20} />
                            </button>

                            <h3 className="text-2xl font-black uppercase text-white mb-1">
                                Detalhes da Inscrição
                            </h3>
                            <p className="text-sm text-holi-secondary mb-6">
                                {editingReg.event.name || selectedEventSlug}
                            </p>

                            <div className="space-y-6">
                                {/* DADOS DO PARTICIPANTE */}
                                <div className="bg-black/40 border border-white/5 p-4 rounded-2xl space-y-3">
                                    <h4 className="text-xs uppercase tracking-wider text-gray-400 font-bold">Participante</h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-gray-500 text-xs block">Nome</span>
                                            <span className="text-white font-bold">{editingReg.participant.full_name}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-xs block">E-mail</span>
                                            <span className="text-white">{editingReg.participant.email || '-'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-xs block">Telefone</span>
                                            <span className="text-white">{editingReg.participant.phone || '-'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-xs block">Paróquia</span>
                                            <span className="text-white">{editingReg.participant.parish || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* ATRIBUIÇÃO DE ANJO */}
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">
                                        Anjo / Responsável
                                    </label>
                                    <input
                                        type="text"
                                        value={editingReg.assigned_angel || ''}
                                        onChange={(e) => setEditingReg({ ...editingReg, assigned_angel: e.target.value })}
                                        placeholder="Nome do Anjo"
                                        className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-holi-primary"
                                    />
                                </div>

                                {/* COMPROVANTE DE PAGAMENTO */}
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">
                                        Comprovante de Pagamento
                                    </label>
                                    {editingReg.payment?.payment_receipt_url ? (
                                        <div className="p-3 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between mb-3">
                                            <span className="text-xs text-green-400 flex items-center gap-1.5">
                                                <CheckCircle size={14} /> Comprovante Anexado
                                            </span>
                                            <a
                                                href={editingReg.payment.payment_receipt_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs text-holi-secondary underline font-bold"
                                            >
                                                Visualizar / Baixar
                                            </a>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-500 mb-3">Nenhum comprovante anexado pelo participante.</p>
                                    )}

                                    <label className="border border-dashed border-white/20 hover:border-holi-primary p-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer bg-white/5 text-xs text-gray-300">
                                        <Upload size={14} />
                                        {uploadingReceipt ? 'Enviando...' : 'Fazer Upload / Substituir Comprovante'}
                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={handleAdminReceiptUpload}
                                            disabled={uploadingReceipt}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                {/* AÇÕES FINAIS */}
                                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => handleTogglePaymentStatus(editingReg)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors ${
                                            editingReg.payment?.status === 'Pago'
                                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                : 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        }`}
                                    >
                                        Marcar como {editingReg.payment?.status === 'Pago' ? 'Pendente' : 'Pago'}
                                    </button>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setEditingReg(null)}
                                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase"
                                        >
                                            Fechar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (editingReg.assigned_angel !== undefined) {
                                                    await updateRegistrationAngel(editingReg.id, editingReg.assigned_angel)
                                                    loadRegistrations()
                                                }
                                                setEditingReg(null)
                                            }}
                                            className="px-5 py-2 bg-holi-primary hover:bg-holi-primary/80 text-white rounded-xl text-xs font-bold uppercase shadow-lg shadow-holi-primary/20"
                                        >
                                            Salvar Alterações
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default RegistrationAdmin
