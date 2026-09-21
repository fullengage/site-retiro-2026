import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users, Phone, Mail, CheckCircle, Clock, XCircle,
    ChevronDown, ChevronUp, DollarSign, Package, Shirt, TrendingUp,
    Sparkles, Loader2, Download, FileSpreadsheet, Plus, Edit3, Trash2,
    UserCheck, UserPlus, Shuffle, Search, X, Check, ArrowRight, RefreshCw, AlertCircle
} from 'lucide-react'
import { fetchEvents } from '../services/eventService'
import {
    fetchAllDetailedRegistrations,
    fetchRegisteredAngels,
    saveRegisteredAngels,
    updateRegistrationAngel,
    updateBulkRegistrationAngel,
    renameAngel
} from '../services/registrationService'
import { EventItem, RegistrationDetailed } from '../types/database'

interface AngelPortfolio {
    name: string
    registrations: RegistrationDetailed[]
    totalRevenue: number
    paidCount: number
    pendingCount: number
    canceledCount: number
    isRegisteredOnly?: boolean
}

export const AngelPortfolioPage = () => {
    const { userRole } = useOutletContext<{ userRole: 'admin' | 'redator' }>()
    const [events, setEvents] = useState<EventItem[]>([])
    const [selectedEventSlug, setSelectedEventSlug] = useState<string>('adonai-2026')
    const [registrations, setRegistrations] = useState<RegistrationDetailed[]>([])
    const [registeredAngels, setRegisteredAngels] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [expandedAngel, setExpandedAngel] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // Seleção múltipla de participantes para ações em massa
    const [selectedRegIds, setSelectedRegIds] = useState<string[]>([])

    // Modais
    const [isManageAngelsModalOpen, setIsManageAngelsModalOpen] = useState(false)
    const [newAngelInput, setNewAngelInput] = useState('')
    const [editingAngelName, setEditingAngelName] = useState<{ oldName: string; newName: string } | null>(null)

    // Modal para adicionar participantes a um anjo específico
    const [targetAngelForAdding, setTargetAngelForAdding] = useState<string | null>(null)
    const [addModalSearch, setAddModalSearch] = useState('')
    const [selectedForTargetAngel, setSelectedForTargetAngel] = useState<string[]>([])

    // Modal para atribuir anjo aos selecionados
    const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false)
    const [bulkSelectedAngel, setBulkSelectedAngel] = useState<string>('')

    // Modal de distribuição automática / balanceamento
    const [isAutoDistributeModalOpen, setIsAutoDistributeModalOpen] = useState(false)

    // Popover / inline dropdown de troca de anjo rápida por linha
    const [activeDropdownRegId, setActiveDropdownRegId] = useState<string | null>(null)

    useEffect(() => {
        const loadInitialData = async () => {
            const [evts, angels] = await Promise.all([
                fetchEvents(),
                fetchRegisteredAngels()
            ])
            setEvents(evts)
            setRegisteredAngels(angels)

            // Define evento ativo (adonai-2026 como preferencial se existir)
            const adonai = evts.find(e => e.slug === 'adonai-2026')
            const activeEvt = adonai || evts.find(e => e.status === 'active') || evts[0]
            if (activeEvt) {
                setSelectedEventSlug(activeEvt.slug)
            } else {
                setSelectedEventSlug('all')
            }
        }
        loadInitialData()
    }, [])

    useEffect(() => {
        if (selectedEventSlug) {
            loadRegistrations()
        }
    }, [selectedEventSlug])

    const showToast = (type: 'success' | 'error', text: string) => {
        setToastMessage({ type, text })
        setTimeout(() => setToastMessage(null), 4000)
    }

    const loadRegistrations = async () => {
        setLoading(true)
        try {
            const [data, angels] = await Promise.all([
                fetchAllDetailedRegistrations(selectedEventSlug),
                fetchRegisteredAngels()
            ])
            setRegistrations(data || [])
            setRegisteredAngels(angels)
            setSelectedRegIds([])
        } catch (err) {
            console.error('Erro ao carregar dados:', err)
            showToast('error', 'Erro ao carregar dados das inscrições.')
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

    // Lista unificada de todos os anjos disponíveis
    const allAvailableAngels = React.useMemo(() => {
        const fromRegs = registrations.map(r => r.assigned_angel?.trim()).filter(Boolean) as string[]
        const merged = Array.from(new Set([...registeredAngels, ...fromRegs])).sort()
        return merged
    }, [registeredAngels, registrations])

    // Agrupar por anjo (incluindo anjos cadastrados que ainda têm 0 participantes)
    const angelPortfolios: AngelPortfolio[] = React.useMemo(() => {
        const grouped = new Map<string, RegistrationDetailed[]>()

        // Inicializa com todos os anjos cadastrados
        allAvailableAngels.forEach(name => {
            grouped.set(name, [])
        })

        if (!grouped.has('Sem Anjo')) {
            grouped.set('Sem Anjo', [])
        }

        // Distribui as inscrições
        registrations.forEach(reg => {
            const angelName = (reg.assigned_angel || '').trim() || 'Sem Anjo'
            if (!grouped.has(angelName)) {
                grouped.set(angelName, [])
            }
            grouped.get(angelName)!.push(reg)
        })

        const portfolios: AngelPortfolio[] = []
        grouped.forEach((regs, name) => {
            // Se for 'Sem Anjo' e tiver 0, não precisa ocultar para dar visibilidade
            const paidCount = regs.filter(r => r.payment?.status === 'Pago' || r.status === 'Confirmada').length
            const pendingCount = regs.filter(r => (r.payment?.status || r.status) !== 'Pago' && r.status !== 'Confirmada' && r.status !== 'Cancelada').length
            const canceledCount = regs.filter(r => r.payment?.status === 'Cancelado' || r.status === 'Cancelada').length
            const totalRevenue = regs
                .filter(r => r.status !== 'Cancelada' && r.payment?.status !== 'Cancelado')
                .reduce((sum, r) => sum + (Number(r.payment?.amount) || 0), 0)

            portfolios.push({
                name,
                registrations: regs,
                totalRevenue,
                paidCount,
                pendingCount,
                canceledCount,
                isRegisteredOnly: regs.length === 0
            })
        })

        // Ordenar: 'Sem Anjo' sempre no topo se tiver participantes para dar atenção, ou por nome
        return portfolios.sort((a, b) => {
            if (a.name === 'Sem Anjo') return -1 // Coloca Sem Anjo em primeiro destaque se houver
            if (b.name === 'Sem Anjo') return 1
            // Mostra os que têm participantes primeiro, depois os vazios
            if (a.registrations.length > 0 && b.registrations.length === 0) return -1
            if (a.registrations.length === 0 && b.registrations.length > 0) return 1
            return a.name.localeCompare(b.name)
        })
    }, [registrations, allAvailableAngels])

    const filteredPortfolios = angelPortfolios.filter(portfolio => {
        const lowerSearch = (searchTerm || '').toLowerCase().trim()
        const portfolioName = portfolio.name || ''
        if (!lowerSearch) return true
        return portfolioName.toLowerCase().includes(lowerSearch) ||
            portfolio.registrations.some(r => {
                const name = r.participant?.full_name || ''
                const email = r.participant?.email || ''
                const phone = r.participant?.phone || ''
                const city = r.participant?.city || ''
                return name.toLowerCase().includes(lowerSearch) ||
                    email.toLowerCase().includes(lowerSearch) ||
                    phone.includes(lowerSearch) ||
                    city.toLowerCase().includes(lowerSearch)
            })
    })

    const grandTotalRevenue = angelPortfolios.reduce((sum, p) => sum + p.totalRevenue, 0)
    const grandTotalPaid = angelPortfolios.reduce((sum, p) => sum + p.paidCount, 0)
    const grandTotalPending = angelPortfolios.reduce((sum, p) => sum + p.pendingCount, 0)
    const unassignedCount = registrations.filter(r => !(r.assigned_angel || '').trim()).length

    // Atribuir anjo individual
    const handleAssignSingleAngel = async (registrationId: string, angelName: string | null) => {
        setActionLoading(true)
        try {
            await updateRegistrationAngel(registrationId, angelName)
            showToast('success', angelName ? `Participante atribuído a ${angelName}!` : 'Anjo removido com sucesso!')
            setActiveDropdownRegId(null)
            loadRegistrations()
        } catch (err: any) {
            showToast('error', 'Falha ao atualizar anjo: ' + err.message)
        } finally {
            setActionLoading(false)
        }
    }

    // Atribuir anjo em lote
    const handleBulkAssign = async () => {
        if (!bulkSelectedAngel) {
            showToast('error', 'Selecione um anjo para atribuir.')
            return
        }
        if (selectedRegIds.length === 0) {
            showToast('error', 'Nenhum participante selecionado.')
            return
        }

        setActionLoading(true)
        try {
            const angelVal = bulkSelectedAngel === 'Sem Anjo' ? null : bulkSelectedAngel
            await updateBulkRegistrationAngel(selectedRegIds, angelVal)
            showToast('success', `${selectedRegIds.length} participante(s) atribuído(s) com sucesso a ${bulkSelectedAngel}!`)
            setIsBulkAssignModalOpen(false)
            setSelectedRegIds([])
            loadRegistrations()
        } catch (err: any) {
            showToast('error', 'Erro ao atribuir em lote: ' + err.message)
        } finally {
            setActionLoading(false)
        }
    }

    // Adicionar múltiplos participantes a um anjo específico
    const handleAddSelectedToTargetAngel = async () => {
        if (!targetAngelForAdding) return
        if (selectedForTargetAngel.length === 0) {
            showToast('error', 'Selecione pelo menos um participante.')
            return
        }

        setActionLoading(true)
        try {
            await updateBulkRegistrationAngel(selectedForTargetAngel, targetAngelForAdding)
            showToast('success', `${selectedForTargetAngel.length} participante(s) adicionado(s) a ${targetAngelForAdding}!`)
            setTargetAngelForAdding(null)
            setSelectedForTargetAngel([])
            loadRegistrations()
        } catch (err: any) {
            showToast('error', 'Erro ao adicionar participantes: ' + err.message)
        } finally {
            setActionLoading(false)
        }
    }

    // Cadastrar novo anjo
    const handleAddNewAngel = async (e: React.FormEvent) => {
        e.preventDefault()
        const trimmed = newAngelInput.trim()
        if (!trimmed) return

        const names = trimmed.split(',').map(n => n.trim()).filter(Boolean)
        const updated = Array.from(new Set([...registeredAngels, ...names])).sort()

        setActionLoading(true)
        const ok = await saveRegisteredAngels(updated)
        if (ok) {
            setRegisteredAngels(updated)
            setNewAngelInput('')
            showToast('success', `${names.length > 1 ? 'Novos anjos cadastrados' : `Anjo "${names[0]}" cadastrado`} com sucesso!`)
        } else {
            showToast('error', 'Erro ao salvar novo anjo.')
        }
        setActionLoading(false)
    }

    // Renomear anjo
    const handleSaveRenameAngel = async () => {
        if (!editingAngelName) return
        const { oldName, newName } = editingAngelName
        if (!newName.trim() || newName.trim() === oldName) {
            setEditingAngelName(null)
            return
        }

        setActionLoading(true)
        try {
            const currentEvent = events.find(e => e.slug === selectedEventSlug)
            await renameAngel(oldName, newName.trim(), selectedEventSlug === 'all' ? undefined : currentEvent?.id)
            showToast('success', `Anjo "${oldName}" renomeado para "${newName.trim()}" com sucesso!`)
            setEditingAngelName(null)
            loadRegistrations()
        } catch (err: any) {
            showToast('error', 'Erro ao renomear anjo: ' + err.message)
        } finally {
            setActionLoading(false)
        }
    }

    // Remover anjo da lista de equipe cadastrada
    const handleRemoveAngelFromList = async (angelName: string) => {
        if (!window.confirm(`Deseja remover "${angelName}" da lista de equipe de anjos? As inscrições atribuídas a ele continuarão mantidas até você transferi-las.`)) {
            return
        }

        const updated = registeredAngels.filter(a => a !== angelName)
        setActionLoading(true)
        const ok = await saveRegisteredAngels(updated)
        if (ok) {
            setRegisteredAngels(updated)
            showToast('success', `"${angelName}" removido da lista de equipe.`)
        } else {
            showToast('error', 'Erro ao atualizar lista.')
        }
        setActionLoading(false)
    }

    // Distribuir participantes sem anjo automaticamente / balancear
    const handleAutoDistribute = async () => {
        const unassigned = registrations.filter(r => !(r.assigned_angel || '').trim())
        if (unassigned.length === 0) {
            showToast('error', 'Não há participantes sem anjo para distribuir.')
            setIsAutoDistributeModalOpen(false)
            return
        }

        const activeAngelsList = allAvailableAngels.filter(a => a !== 'Sem Anjo')
        if (activeAngelsList.length === 0) {
            showToast('error', 'Cadastre pelo menos um anjo antes de distribuir.')
            return
        }

        setActionLoading(true)
        try {
            // Distribuição balanceada (Round-Robin)
            for (let i = 0; i < unassigned.length; i++) {
                const angel = activeAngelsList[i % activeAngelsList.length]
                await updateRegistrationAngel(unassigned[i].id, angel)
            }

            showToast('success', `${unassigned.length} participantes distribuídos equilibradamente entre ${activeAngelsList.length} anjos!`)
            setIsAutoDistributeModalOpen(false)
            loadRegistrations()
        } catch (err: any) {
            showToast('error', 'Erro na distribuição automática: ' + err.message)
        } finally {
            setActionLoading(false)
        }
    }

    // Alternar seleção de participante
    const toggleSelectReg = (id: string) => {
        setSelectedRegIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        )
    }

    // Selecionar todos os participantes de uma lista
    const toggleSelectAll = (regs: RegistrationDetailed[]) => {
        const ids = regs.map(r => r.id)
        const allSelected = ids.every(id => selectedRegIds.includes(id))
        if (allSelected) {
            setSelectedRegIds(prev => prev.filter(id => !ids.includes(id)))
        } else {
            setSelectedRegIds(prev => Array.from(new Set([...prev, ...ids])))
        }
    }

    return (
        <div className="space-y-8 pb-16">
            {/* TOAST NOTIFICAÇÃO */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${
                            toastMessage.type === 'success'
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                : 'bg-red-500/20 border-red-500/50 text-red-300'
                        }`}
                    >
                        {toastMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <span className="font-bold text-sm">{toastMessage.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CABEÇALHO & SELETOR DE EVENTO */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-holi-surface/80 border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-2xl">
                <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-holi-primary/20 border border-holi-primary/30 text-xs font-mono tracking-widest uppercase text-holi-primary">
                            <Users size={14} />
                            <span>Equipe de Acolhimento</span>
                        </div>
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-bold uppercase">
                            {allAvailableAngels.length} Anjos Cadastrados
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white">
                        Carteira de Anjos
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Cadastre e edite anjos, acompanhe participantes e distribua os afilhados do <strong className="text-white">Retiro Adonai 2026</strong>.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* BOTÃO GERENCIAR ANJOS */}
                    <button
                        onClick={() => setIsManageAngelsModalOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-holi-primary to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-holi-primary/20 text-xs uppercase tracking-wider hover:scale-105 active:scale-95"
                    >
                        <UserPlus size={16} />
                        <span>Gerenciar / Novo Anjo</span>
                    </button>

                    {/* BOTÃO DISTRIBUIR / BALANCEAR */}
                    {unassignedCount > 0 && (
                        <button
                            onClick={() => setIsAutoDistributeModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-3 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-black rounded-2xl transition-all text-xs uppercase tracking-wider"
                            title="Distribuir participantes sem anjo igualmente entre os anjos"
                        >
                            <Shuffle size={16} />
                            <span>Distribuir Sem Anjo ({unassignedCount})</span>
                        </button>
                    )}

                    {/* BOTÃO BAIXAR PLANILHA */}
                    <button
                        onClick={handleExportSpreadsheet}
                        disabled={loading || registrations.length === 0}
                        className="inline-flex items-center gap-2 px-4 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-black rounded-2xl transition-all text-xs uppercase tracking-wider disabled:opacity-50"
                        title="Baixar planilha Excel / CSV"
                    >
                        <FileSpreadsheet size={16} />
                        <span>Planilha</span>
                        <Download size={14} />
                    </button>

                    {/* RECARREGAR */}
                    <button
                        onClick={loadRegistrations}
                        disabled={loading}
                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all"
                        title="Recarregar dados"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* SELETOR DE RETIRO & RESUMO */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10 overflow-x-auto">
                    {events.map(evt => (
                        <button
                            key={evt.slug}
                            onClick={() => setSelectedEventSlug(evt.slug)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${
                                selectedEventSlug === evt.slug
                                    ? 'bg-gradient-to-r from-holi-primary to-purple-600 text-white shadow-lg shadow-holi-primary/25'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {evt.status === 'active' && <Sparkles size={14} className="text-holi-accent" />}
                            <span>{evt.name.replace('Retiro de ', '').replace('Retiro ', '')}</span>
                            {evt.status === 'active' && (
                                <span className="px-1.5 py-0.2 bg-white/20 rounded text-[9px]">Ativo</span>
                            )}
                        </button>
                    ))}
                    <button
                        onClick={() => setSelectedEventSlug('all')}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                            selectedEventSlug === 'all'
                                ? 'bg-white text-black shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        Todos os Retiros ({registrations.length})
                    </button>
                </div>

                {/* AÇÕES EM MASSA (SE HOUVER ITENS SELECIONADOS) */}
                {selectedRegIds.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3 bg-holi-primary/20 border border-holi-primary/40 px-4 py-2 rounded-2xl backdrop-blur-md"
                    >
                        <span className="text-xs font-bold text-white font-mono">
                            {selectedRegIds.length} selecionado(s)
                        </span>
                        <button
                            onClick={() => {
                                setBulkSelectedAngel(allAvailableAngels[0] || '')
                                setIsBulkAssignModalOpen(true)
                            }}
                            className="px-3 py-1.5 bg-holi-primary hover:bg-fuchsia-600 text-white text-xs font-black uppercase rounded-xl shadow transition-all flex items-center gap-1.5"
                        >
                            <UserCheck size={14} />
                            <span>Atribuir a um Anjo...</span>
                        </button>
                        <button
                            onClick={() => setSelectedRegIds([])}
                            className="p-1.5 text-gray-400 hover:text-white text-xs"
                            title="Desmarcar todos"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </div>

            {/* CARDS DE RESUMO / MÉTRICAS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-holi-surface border border-white/10 p-5 rounded-3xl">
                    <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Anjos Cadastrados</span>
                    <div className="text-3xl font-black text-white">
                        {allAvailableAngels.length}
                    </div>
                    <span className="text-[11px] text-gray-400 mt-1 block">Equipe de acolhimento</span>
                </div>

                <div className="bg-holi-surface border border-white/10 p-5 rounded-3xl">
                    <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Participantes</span>
                    <div className="text-3xl font-black text-holi-primary">{registrations.length}</div>
                    <span className="text-[11px] text-gray-400 mt-1 block">Inscritos no evento</span>
                </div>

                <div className="bg-holi-surface border border-white/10 p-5 rounded-3xl">
                    <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Confirmados / Pagos</span>
                    <div className="text-3xl font-black text-green-400">{grandTotalPaid}</div>
                    <span className="text-[11px] text-gray-400 mt-1 block">Validados</span>
                </div>

                <div className="bg-holi-surface border border-white/10 p-5 rounded-3xl">
                    <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Sem Anjo Atribuído</span>
                    <div className={`text-3xl font-black ${unassignedCount > 0 ? 'text-amber-400' : 'text-gray-400'}`}>
                        {unassignedCount}
                    </div>
                    <span className="text-[11px] text-gray-400 mt-1 block">Aguardando padrinho</span>
                </div>
            </div>

            {/* BARRA DE BUSCA & FILTRO */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                    type="text"
                    placeholder="Buscar por anjo, nome do participante, WhatsApp, cidade ou e-mail..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-black/50 border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-holi-primary transition-all shadow-inner"
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* LISTA DE CARTEIRAS DE ANJOS */}
            {loading ? (
                <div className="py-24 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-holi-primary mx-auto mb-3" />
                    <p className="text-gray-400 text-sm font-mono">Carregando carteiras de anjos...</p>
                </div>
            ) : filteredPortfolios.length === 0 ? (
                <div className="py-20 text-center text-gray-400 bg-holi-surface border border-white/10 rounded-3xl">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-lg font-bold text-white mb-1">Nenhum registro encontrado</p>
                    <p className="text-xs text-gray-500">Tente buscar por outro termo ou cadastre novos anjos.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredPortfolios.map(portfolio => {
                        const isExpanded = expandedAngel === portfolio.name || (portfolio.name === 'Sem Anjo' && expandedAngel === null && portfolio.registrations.length > 0)
                        const isNoAngel = portfolio.name === 'Sem Anjo'
                        const hasRegistrations = portfolio.registrations.length > 0

                        return (
                            <div
                                key={portfolio.name}
                                className={`bg-holi-surface border rounded-3xl overflow-hidden transition-all duration-300 shadow-xl ${
                                    isNoAngel && hasRegistrations
                                        ? 'border-amber-500/40 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent'
                                        : 'border-white/10 hover:border-white/20'
                                }`}
                            >
                                {/* HEADER DO CARD DO ANJO */}
                                <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div
                                        onClick={() => setExpandedAngel(isExpanded ? '__none__' : portfolio.name)}
                                        className="flex items-center gap-4 cursor-pointer flex-1"
                                    >
                                        <div
                                            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border shrink-0 ${
                                                isNoAngel
                                                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                                                    : hasRegistrations
                                                        ? 'bg-gradient-to-br from-holi-primary/30 to-purple-600/30 border-holi-primary/40 text-holi-primary'
                                                        : 'bg-white/5 border-white/10 text-gray-500'
                                            }`}
                                        >
                                            {portfolio.name.charAt(0).toUpperCase()}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2.5">
                                                <h3 className="font-black text-white text-lg md:text-xl tracking-tight">
                                                    {portfolio.name}
                                                </h3>
                                                {isNoAngel ? (
                                                    <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase rounded-full">
                                                        Requer Atenção ({portfolio.registrations.length})
                                                    </span>
                                                ) : portfolio.registrations.length === 0 ? (
                                                    <span className="px-2 py-0.5 bg-white/5 text-gray-500 text-[10px] font-bold uppercase rounded-full">
                                                        Sem afilhados
                                                    </span>
                                                ) : null}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5 font-medium">
                                                {portfolio.registrations.length === 0
                                                    ? 'Nenhum participante vinculado a este anjo no momento'
                                                    : `${portfolio.registrations.length} participante(s) sob sua responsabilidade`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* AÇÕES E ESTATÍSTICAS DO ANJO */}
                                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                                        {/* MÉTRICAS */}
                                        {hasRegistrations && (
                                            <div className="flex items-center gap-2 font-mono text-xs">
                                                <span className="px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full font-bold">
                                                    {portfolio.paidCount} Pagos
                                                </span>
                                                {portfolio.pendingCount > 0 && (
                                                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-bold">
                                                        {portfolio.pendingCount} Pendentes
                                                    </span>
                                                )}
                                                <span className="text-gray-300 font-bold hidden sm:inline">
                                                    R$ {portfolio.totalRevenue.toLocaleString('pt-BR')}
                                                </span>
                                            </div>
                                        )}

                                        {/* BOTÃO ADICIONAR PARTICIPANTES A ESTE ANJO */}
                                        {!isNoAngel && (
                                            <button
                                                onClick={() => {
                                                    setTargetAngelForAdding(portfolio.name)
                                                    setSelectedForTargetAngel([])
                                                    setAddModalSearch('')
                                                }}
                                                className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
                                                title={`Adicionar participantes a ${portfolio.name}`}
                                            >
                                                <Plus size={14} className="text-holi-primary" />
                                                <span className="hidden sm:inline">Adicionar</span>
                                            </button>
                                        )}

                                        {/* BOTÃO RENOMEAR ANJO */}
                                        {!isNoAngel && (
                                            <button
                                                onClick={() => setEditingAngelName({ oldName: portfolio.name, newName: portfolio.name })}
                                                className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all"
                                                title={`Renomear anjo "${portfolio.name}"`}
                                            >
                                                <Edit3 size={15} />
                                            </button>
                                        )}

                                        {/* BOTÃO EXPANDIR / RECOLHER */}
                                        <button
                                            onClick={() => setExpandedAngel(isExpanded ? '__none__' : portfolio.name)}
                                            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                                        >
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {/* LISTA DE PARTICIPANTES DO ANJO (EXPANSÍVEL) */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="border-t border-white/10 bg-black/40 p-4 sm:p-6 space-y-4"
                                        >
                                            {portfolio.registrations.length === 0 ? (
                                                <div className="py-8 text-center">
                                                    <p className="text-gray-400 text-xs mb-3">
                                                        Nenhum participante atribuído a <strong>{portfolio.name}</strong> neste retiro.
                                                    </p>
                                                    <button
                                                        onClick={() => {
                                                            setTargetAngelForAdding(portfolio.name)
                                                            setSelectedForTargetAngel([])
                                                            setAddModalSearch('')
                                                        }}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-holi-primary hover:bg-fuchsia-600 text-white rounded-xl text-xs font-bold uppercase transition-all"
                                                    >
                                                        <Plus size={14} />
                                                        <span>Vincular Participantes Agora</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center justify-between text-xs text-gray-400 pb-2 border-b border-white/5">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => toggleSelectAll(portfolio.registrations)}
                                                                className="text-xs font-mono uppercase text-holi-secondary hover:underline"
                                                            >
                                                                Selecionar todos ({portfolio.registrations.length})
                                                            </button>
                                                        </div>
                                                        <div className="text-[11px] font-mono text-gray-500">
                                                            Clique no anjo de qualquer linha para alterar rapidamente
                                                        </div>
                                                    </div>

                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-left text-xs">
                                                            <thead>
                                                                <tr className="text-gray-500 border-b border-white/10 uppercase tracking-wider font-mono text-[11px]">
                                                                    <th className="pb-3 w-8">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={portfolio.registrations.every(r => selectedRegIds.includes(r.id))}
                                                                            onChange={() => toggleSelectAll(portfolio.registrations)}
                                                                            className="rounded bg-black border-white/30 text-holi-primary focus:ring-0"
                                                                        />
                                                                    </th>
                                                                    <th className="pb-3 font-bold">Participante</th>
                                                                    <th className="pb-3 font-bold">WhatsApp / Contato</th>
                                                                    <th className="pb-3 font-bold">Idade / Cidade</th>
                                                                    <th className="pb-3 font-bold">Kit / Camiseta</th>
                                                                    <th className="pb-3 font-bold">Status PIX</th>
                                                                    <th className="pb-3 font-bold">Anjo Atual</th>
                                                                    <th className="pb-3 font-bold text-right">Ação</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-white/5">
                                                                {portfolio.registrations.map(reg => {
                                                                    const isPaid = reg.payment?.status === 'Pago' || reg.status === 'Confirmada'
                                                                    const age = calculateAge(reg.participant.birth_date)
                                                                    const isSelected = selectedRegIds.includes(reg.id)

                                                                    return (
                                                                        <tr
                                                                            key={reg.id}
                                                                            className={`hover:bg-white/[0.03] transition-colors ${
                                                                                isSelected ? 'bg-holi-primary/10' : ''
                                                                            }`}
                                                                        >
                                                                            <td className="py-3">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={isSelected}
                                                                                    onChange={() => toggleSelectReg(reg.id)}
                                                                                    className="rounded bg-black border-white/30 text-holi-primary focus:ring-0"
                                                                                />
                                                                            </td>
                                                                            <td className="py-3 font-bold text-white">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span>{reg.participant.full_name}</span>
                                                                                    {reg.staying_on_site && (
                                                                                        <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 text-[9px] rounded font-mono">
                                                                                            Camping
                                                                                        </span>
                                                                                    )}
                                                                                </div>
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
                                                                            </td>
                                                                            <td className="py-3 text-gray-400">
                                                                                <div>{age} anos</div>
                                                                                <div className="text-[11px] text-gray-500">{reg.participant.city || 'N/D'}</div>
                                                                            </td>
                                                                            <td className="py-3 text-gray-300">
                                                                                <div className="truncate max-w-[150px]">{reg.kit_option}</div>
                                                                                {(reg.tshirt_size || reg.tshirt_size_2) && (
                                                                                    <span className="text-[11px] text-holi-accent flex items-center gap-1 mt-0.5">
                                                                                        <Shirt size={10} />
                                                                                        {[reg.tshirt_size, reg.tshirt_size_2].filter(Boolean).join(', ')}
                                                                                    </span>
                                                                                )}
                                                                            </td>
                                                                            <td className="py-3 font-mono">
                                                                                {isPaid ? (
                                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full font-bold text-[11px]">
                                                                                        <CheckCircle size={11} /> Pago
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-bold text-[11px]">
                                                                                        <Clock size={11} /> Pendente
                                                                                    </span>
                                                                                )}
                                                                            </td>
                                                                            <td className="py-3">
                                                                                {/* SELECT RÁPIDO DE ANJO */}
                                                                                <select
                                                                                    value={reg.assigned_angel || ''}
                                                                                    onChange={(e) => handleAssignSingleAngel(reg.id, e.target.value || null)}
                                                                                    disabled={actionLoading}
                                                                                    className="bg-black/60 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-holi-primary outline-none transition-all cursor-pointer font-sans"
                                                                                >
                                                                                    <option value="">Sem Anjo</option>
                                                                                    {allAvailableAngels.map(angel => (
                                                                                        <option key={angel} value={angel} className="bg-gray-900 text-white">
                                                                                            {angel}
                                                                                        </option>
                                                                                    ))}
                                                                                </select>
                                                                            </td>
                                                                            <td className="py-3 text-right">
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setSelectedRegIds([reg.id])
                                                                                        setBulkSelectedAngel(allAvailableAngels[0] || '')
                                                                                        setIsBulkAssignModalOpen(true)
                                                                                    }}
                                                                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                                                                                    title="Mover para outro anjo"
                                                                                >
                                                                                    <Edit3 size={14} />
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* MODAL 1: GERENCIAR EQUIPE DE ANJOS / CADASTRAR NOVO */}
            <AnimatePresence>
                {isManageAngelsModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !actionLoading && setIsManageAngelsModalOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-[#12081f] border border-white/20 rounded-3xl p-6 sm:p-8 max-w-xl w-full relative z-10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-holi-primary/20 rounded-2xl text-holi-primary">
                                        <Users size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase text-white">
                                            Equipe de Anjos
                                        </h3>
                                        <p className="text-xs text-gray-400 font-mono">
                                            Cadastre e gerencie a lista de anjos do Retiro Adonai
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => !actionLoading && setIsManageAngelsModalOpen(false)}
                                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* FORMULÁRIO DE NOVO ANJO */}
                            <form onSubmit={handleAddNewAngel} className="mb-6 shrink-0">
                                <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">
                                    Adicionar Novo(s) Anjo(s)
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newAngelInput}
                                        onChange={(e) => setNewAngelInput(e.target.value)}
                                        placeholder="Ex: Gabriel, Amanda, Rodrigo (separe por vírgula)"
                                        required
                                        className="flex-1 bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-holi-primary outline-none transition-all placeholder-gray-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={actionLoading || !newAngelInput.trim()}
                                        className="inline-flex items-center gap-1.5 px-5 py-3 bg-holi-primary hover:bg-fuchsia-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow transition-all disabled:opacity-50 shrink-0"
                                    >
                                        <Plus size={16} />
                                        <span>Adicionar</span>
                                    </button>
                                </div>
                                <p className="text-[11px] text-gray-500 mt-1">
                                    Dica: Você pode digitar um nome individual ou vários separados por vírgula.
                                </p>
                            </form>

                            {/* LISTA DE ANJOS CADASTRADOS */}
                            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                                <div className="text-xs font-bold uppercase text-gray-400 mb-2 flex items-center justify-between">
                                    <span>Anjos na Equipe ({allAvailableAngels.length})</span>
                                    <span className="text-[10px] text-gray-500 font-mono">Clique no ícone de lápis para editar</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {allAvailableAngels.map(angel => {
                                        const count = registrations.filter(r => (r.assigned_angel || '').trim() === angel).length

                                        return (
                                            <div
                                                key={angel}
                                                className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between gap-2 hover:bg-white/[0.08] transition-all"
                                            >
                                                <div className="flex items-center gap-2.5 truncate">
                                                    <div className="w-7 h-7 rounded-lg bg-holi-primary/20 text-holi-primary font-bold text-xs flex items-center justify-center shrink-0">
                                                        {angel.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-bold text-white truncate">
                                                        {angel}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1 shrink-0">
                                                    <span className="px-2 py-0.5 bg-black/40 text-[10px] font-mono text-gray-400 rounded-md">
                                                        {count} {count === 1 ? 'afilh.' : 'afilh.'}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            setIsManageAngelsModalOpen(false)
                                                            setEditingAngelName({ oldName: angel, newName: angel })
                                                        }}
                                                        className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
                                                        title="Editar nome do anjo"
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveAngelFromList(angel)}
                                                        className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10"
                                                        title="Remover da lista de equipe"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="pt-4 mt-4 border-t border-white/10 flex justify-end shrink-0">
                                <button
                                    onClick={() => setIsManageAngelsModalOpen(false)}
                                    className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase rounded-xl transition-all"
                                >
                                    Fechar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL 2: RENOMEAR ANJO */}
            <AnimatePresence>
                {editingAngelName && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !actionLoading && setEditingAngelName(null)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-[#12081f] border border-white/20 rounded-3xl p-6 sm:p-8 max-w-md w-full relative z-10 shadow-2xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-holi-secondary/20 rounded-2xl text-holi-secondary">
                                        <Edit3 size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase text-white">
                                            Editar Nome do Anjo
                                        </h3>
                                        <p className="text-xs text-gray-400 font-mono">
                                            Atualizará todas as inscrições atribuídas
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => !actionLoading && setEditingAngelName(null)}
                                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">
                                        Nome Atual
                                    </label>
                                    <input
                                        type="text"
                                        value={editingAngelName.oldName}
                                        disabled
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-400 cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">
                                        Novo Nome
                                    </label>
                                    <input
                                        type="text"
                                        value={editingAngelName.newName}
                                        onChange={(e) => setEditingAngelName({ ...editingAngelName, newName: e.target.value })}
                                        placeholder="Digite o novo nome do anjo"
                                        autoFocus
                                        className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-holi-primary outline-none transition-all font-bold"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setEditingAngelName(null)}
                                        disabled={actionLoading}
                                        className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold text-xs uppercase transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSaveRenameAngel}
                                        disabled={actionLoading || !editingAngelName.newName.trim()}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-holi-primary hover:bg-fuchsia-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow transition-all"
                                    >
                                        {actionLoading ? 'Salvando...' : 'Salvar Alteração'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL 3: ADICIONAR PARTICIPANTES A UM ANJO ESPECÍFICO */}
            <AnimatePresence>
                {targetAngelForAdding && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !actionLoading && setTargetAngelForAdding(null)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-[#12081f] border border-white/20 rounded-3xl p-6 sm:p-8 max-w-2xl w-full relative z-10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-holi-primary/20 rounded-2xl text-holi-primary">
                                        <UserPlus size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase text-white">
                                            Vincular Participantes a {targetAngelForAdding}
                                        </h3>
                                        <p className="text-xs text-gray-400 font-mono">
                                            Selecione participantes deste retiro para atribuir a este anjo
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => !actionLoading && setTargetAngelForAdding(null)}
                                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* BUSCA NO MODAL */}
                            <div className="relative mb-4 shrink-0">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="Filtrar por nome, telefone ou cidade..."
                                    value={addModalSearch}
                                    onChange={(e) => setAddModalSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/15 rounded-xl text-xs text-white placeholder-gray-500 focus:border-holi-primary outline-none"
                                />
                            </div>

                            {/* LISTA DE PARTICIPANTES DISPONÍVEIS */}
                            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5">
                                {registrations
                                    .filter(r => {
                                        // Não mostra os que já estão neste anjo
                                        if ((r.assigned_angel || '').trim() === targetAngelForAdding) return false
                                        if (!addModalSearch) return true
                                        const term = addModalSearch.toLowerCase()
                                        return (r.participant?.full_name || '').toLowerCase().includes(term) ||
                                            (r.participant?.phone || '').includes(term) ||
                                            (r.participant?.city || '').toLowerCase().includes(term)
                                    })
                                    .map(reg => {
                                        const isChecked = selectedForTargetAngel.includes(reg.id)
                                        const currentAngel = (reg.assigned_angel || '').trim() || 'Sem Anjo'

                                        return (
                                            <div
                                                key={reg.id}
                                                onClick={() => {
                                                    setSelectedForTargetAngel(prev =>
                                                        prev.includes(reg.id) ? prev.filter(i => i !== reg.id) : [...prev, reg.id]
                                                    )
                                                }}
                                                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                                                    isChecked
                                                        ? 'bg-holi-primary/20 border-holi-primary text-white'
                                                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 truncate">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => {}}
                                                        className="rounded bg-black border-white/30 text-holi-primary focus:ring-0"
                                                    />
                                                    <div>
                                                        <div className="font-bold text-xs text-white truncate">
                                                            {reg.participant.full_name}
                                                        </div>
                                                        <div className="text-[10px] text-gray-400 flex items-center gap-2">
                                                            <span>{reg.participant.phone || 'Sem fone'}</span>
                                                            <span>•</span>
                                                            <span>{reg.participant.city || 'N/D'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono shrink-0 ${
                                                    currentAngel === 'Sem Anjo'
                                                        ? 'bg-amber-500/20 text-amber-300'
                                                        : 'bg-white/10 text-gray-400'
                                                }`}>
                                                    Atual: {currentAngel}
                                                </span>
                                            </div>
                                        )
                                    })}
                            </div>

                            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between shrink-0">
                                <span className="text-xs font-mono text-gray-400">
                                    {selectedForTargetAngel.length} selecionado(s)
                                </span>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setTargetAngelForAdding(null)}
                                        disabled={actionLoading}
                                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-bold uppercase transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleAddSelectedToTargetAngel}
                                        disabled={actionLoading || selectedForTargetAngel.length === 0}
                                        className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-holi-primary hover:bg-fuchsia-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow transition-all disabled:opacity-50"
                                    >
                                        <Check size={16} />
                                        <span>Confirmar Atribuição</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL 4: ATRIBUIÇÃO EM MASSA PARA PARTICIPANTES SELECIONADOS */}
            <AnimatePresence>
                {isBulkAssignModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !actionLoading && setIsBulkAssignModalOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-[#12081f] border border-white/20 rounded-3xl p-6 sm:p-8 max-w-md w-full relative z-10 shadow-2xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-holi-primary/20 rounded-2xl text-holi-primary">
                                        <UserCheck size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase text-white">
                                            Atribuir em Massa
                                        </h3>
                                        <p className="text-xs text-gray-400 font-mono">
                                            {selectedRegIds.length} participante(s) selecionado(s)
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => !actionLoading && setIsBulkAssignModalOpen(false)}
                                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">
                                        Escolha o Anjo Responsável
                                    </label>
                                    <select
                                        value={bulkSelectedAngel}
                                        onChange={(e) => setBulkSelectedAngel(e.target.value)}
                                        className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-holi-primary outline-none transition-all font-bold"
                                    >
                                        <option value="Sem Anjo">Sem Anjo (Desvincular)</option>
                                        {allAvailableAngels.map(angel => (
                                            <option key={angel} value={angel} className="bg-gray-900 text-white">
                                                {angel}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setIsBulkAssignModalOpen(false)}
                                        disabled={actionLoading}
                                        className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold text-xs uppercase transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleBulkAssign}
                                        disabled={actionLoading}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-holi-primary hover:bg-fuchsia-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow transition-all"
                                    >
                                        {actionLoading ? 'Salvando...' : 'Aplicar Atribuição'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL 5: DISTRIBUIÇÃO AUTOMÁTICA / BALANCEAMENTO */}
            <AnimatePresence>
                {isAutoDistributeModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !actionLoading && setIsAutoDistributeModalOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-[#12081f] border border-white/20 rounded-3xl p-6 sm:p-8 max-w-md w-full relative z-10 shadow-2xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-400">
                                        <Shuffle size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase text-white">
                                            Distribuição Automática
                                        </h3>
                                        <p className="text-xs text-gray-400 font-mono">
                                            Balancear participantes sem anjo
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => !actionLoading && setIsAutoDistributeModalOpen(false)}
                                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <p className="text-sm text-gray-300 leading-relaxed mb-4">
                                Deseja distribuir os <strong className="text-amber-400">{unassignedCount} participantes sem anjo</strong> igualmente entre os <strong className="text-white">{allAvailableAngels.filter(a => a !== 'Sem Anjo').length} anjos cadastrados</strong> da equipe?
                            </p>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-gray-400 space-y-1.5 mb-6 font-mono">
                                <div>• Cada anjo receberá cerca de ~{Math.ceil(unassignedCount / (allAvailableAngels.filter(a => a !== 'Sem Anjo').length || 1))} participantes.</div>
                                <div>• Você poderá reajustar manualmente a qualquer momento.</div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setIsAutoDistributeModalOpen(false)}
                                    disabled={actionLoading}
                                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold text-xs uppercase transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAutoDistribute}
                                    disabled={actionLoading}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow transition-all"
                                >
                                    {actionLoading ? 'Distribuindo...' : 'Confirmar Distribuição'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default AngelPortfolioPage
