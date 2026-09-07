import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Shirt, Search, Download, CheckCircle, AlertCircle,
    Plus, Filter, Printer, Users, Heart, ShoppingBag,
    Sparkles, RefreshCw, ChevronDown, Check, X, FileText,
    Loader2, DollarSign, CreditCard, Banknote, Upload, Trash2, Edit3
} from 'lucide-react'
import { supabase } from '../lib/supabase'

export interface TshirtOrderItem {
    id: string
    name: string
    category: 'Participante' | 'Anjo' | 'Avulso'
    size: 'PP' | 'P' | 'M' | 'G' | 'GG' | 'G1' | 'G2' | 'EXG'
    status: 'Pago' | 'Pendente'
    amount?: number
    payment_method?: string
    phone?: string
    notes?: string
    receipt_url?: string
    registration_id?: string
    created_at?: string
}

const SIZES_ORDER: TshirtOrderItem['size'][] = ['PP', 'P', 'M', 'G', 'GG', 'G1', 'G2', 'EXG']

export default function TshirtOrdersAdmin() {
    const [orders, setOrders] = useState<TshirtOrderItem[]>([])
    const [loading, setLoading] = useState(true)
    const [savingId, setSavingId] = useState<string | null>(null)
    const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

    // Filtros e busca
    const [searchTerm, setSearchTerm] = useState('')
    const [filterCategory, setFilterCategory] = useState<string>('Todos')
    const [filterSize, setFilterSize] = useState<string>('Todos')
    const [filterStatus, setFilterStatus] = useState<string>('Todos')
    const [activeTab, setActiveTab] = useState<'list' | 'production'>('list')

    // Seleção múltipla
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [bulkUpdating, setBulkUpdating] = useState(false)

    // Modal para Adicionar/Editar
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<TshirtOrderItem | null>(null)
    const [formName, setFormName] = useState('')
    const [formCategory, setFormCategory] = useState<'Participante' | 'Anjo' | 'Avulso'>('Avulso')
    const [formSize, setFormSize] = useState<TshirtOrderItem['size']>('M')
    const [formStatus, setFormStatus] = useState<'Pago' | 'Pendente'>('Pago')
    const [formAmount, setFormAmount] = useState<number>(50)
    const [formPaymentMethod, setFormPaymentMethod] = useState('PIX')
    const [formPhone, setFormPhone] = useState('')
    const [formNotes, setFormNotes] = useState('')

    // Modal de Pagamento Rápido
    const [paymentModalItem, setPaymentModalItem] = useState<TshirtOrderItem | null>(null)
    const [quickMethod, setQuickMethod] = useState<'PIX' | 'Dinheiro' | 'Cartão' | 'Outro'>('PIX')

    // Carregar pedidos do Supabase
    const loadOrders = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('tshirt_orders')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            if (data) {
                setOrders(data as TshirtOrderItem[])
            }
        } catch (err: any) {
            console.error('Erro ao carregar camisetas:', err)
            showMessage('Erro ao carregar dados: ' + err.message, 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadOrders()
    }, [])

    const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
        setActionMessage({ text, type })
        setTimeout(() => setActionMessage(null), 4000)
    }

    // Alternar status de pagamento (1 clique)
    const togglePaymentStatus = async (item: TshirtOrderItem) => {
        const nextStatus = item.status === 'Pago' ? 'Pendente' : 'Pago'
        setSavingId(item.id)

        try {
            // 1. Atualiza na tabela tshirt_orders
            const { error } = await supabase
                .from('tshirt_orders')
                .update({
                    status: nextStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', item.id)

            if (error) throw error

            // 2. Se for vinculado a uma inscrição de participante, sincroniza na tabela de registrations e payments
            if (item.registration_id) {
                await supabase
                    .from('payments')
                    .update({ status: nextStatus })
                    .eq('registration_id', item.registration_id)

                await supabase
                    .from('registrations')
                    .update({ status: nextStatus === 'Pago' ? 'Confirmada' : 'Pendente' })
                    .eq('id', item.registration_id)
            }

            // Atualização otimista no estado local
            setOrders(prev => prev.map(o => o.id === item.id ? { ...o, status: nextStatus } : o))
            showMessage(`Camiseta de ${item.name} marcada como ${nextStatus}!`, 'success')
        } catch (err: any) {
            console.error('Erro ao atualizar status:', err)
            showMessage('Erro ao atualizar status: ' + err.message, 'error')
        } finally {
            setSavingId(null)
        }
    }

    // Confirmar pagamento rápido com método
    const confirmQuickPayment = async () => {
        if (!paymentModalItem) return
        setSavingId(paymentModalItem.id)

        try {
            const { error } = await supabase
                .from('tshirt_orders')
                .update({
                    status: 'Pago',
                    payment_method: quickMethod,
                    updated_at: new Date().toISOString()
                })
                .eq('id', paymentModalItem.id)

            if (error) throw error

            if (paymentModalItem.registration_id) {
                await supabase
                    .from('payments')
                    .update({ status: 'Pago' })
                    .eq('registration_id', paymentModalItem.registration_id)

                await supabase
                    .from('registrations')
                    .update({ status: 'Confirmada' })
                    .eq('id', paymentModalItem.registration_id)
            }

            setOrders(prev => prev.map(o => o.id === paymentModalItem.id ? { ...o, status: 'Pago', payment_method: quickMethod } : o))
            showMessage(`Pagamento de ${paymentModalItem.name} confirmado via ${quickMethod}!`, 'success')
            setPaymentModalItem(null)
        } catch (err: any) {
            showMessage('Erro ao confirmar pagamento: ' + err.message, 'error')
        } finally {
            setSavingId(null)
        }
    }

    // Ação em massa: Marcar selecionados como Pago
    const handleBulkMarkPaid = async () => {
        if (selectedIds.length === 0) return
        if (!confirm(`Deseja marcar ${selectedIds.length} camisetas selecionadas como PAGAS?`)) return

        setBulkUpdating(true)
        try {
            const { error } = await supabase
                .from('tshirt_orders')
                .update({
                    status: 'Pago',
                    updated_at: new Date().toISOString()
                })
                .in('id', selectedIds)

            if (error) throw error

            // Sincronizar inscrições vinculadas
            const selectedItems = orders.filter(o => selectedIds.includes(o.id) && o.registration_id)
            for (const item of selectedItems) {
                if (item.registration_id) {
                    await supabase.from('payments').update({ status: 'Pago' }).eq('registration_id', item.registration_id)
                    await supabase.from('registrations').update({ status: 'Confirmada' }).eq('id', item.registration_id)
                }
            }

            setOrders(prev => prev.map(o => selectedIds.includes(o.id) ? { ...o, status: 'Pago' } : o))
            showMessage(`${selectedIds.length} camisetas foram marcadas como PAGAS com sucesso!`, 'success')
            setSelectedIds([])
        } catch (err: any) {
            showMessage('Erro ao atualizar selecionados: ' + err.message, 'error')
        } finally {
            setBulkUpdating(false)
        }
    }

    // Salvar Pedido (Novo ou Edição)
    const handleSaveOrder = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formName.trim()) return

        try {
            if (editingItem) {
                // Editar existente
                const { error } = await supabase
                    .from('tshirt_orders')
                    .update({
                        name: formName.trim(),
                        category: formCategory,
                        size: formSize,
                        status: formStatus,
                        amount: formAmount,
                        payment_method: formPaymentMethod,
                        phone: formPhone.trim() || null,
                        notes: formNotes.trim() || null,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', editingItem.id)

                if (error) throw error

                setOrders(prev => prev.map(o => o.id === editingItem.id ? {
                    ...o,
                    name: formName.trim(),
                    category: formCategory,
                    size: formSize,
                    status: formStatus,
                    amount: formAmount,
                    payment_method: formPaymentMethod,
                    phone: formPhone.trim() || undefined,
                    notes: formNotes.trim() || undefined
                } : o))

                showMessage(`Pedido de ${formName} atualizado com sucesso!`)
            } else {
                // Inserir novo
                const newPayload = {
                    name: formName.trim(),
                    category: formCategory,
                    size: formSize,
                    status: formStatus,
                    amount: formAmount,
                    payment_method: formPaymentMethod,
                    phone: formPhone.trim() || null,
                    notes: formNotes.trim() || null,
                    event_slug: 'adonai-2026'
                }

                const { data, error } = await supabase
                    .from('tshirt_orders')
                    .insert([newPayload])
                    .select()
                    .single()

                if (error) throw error
                if (data) {
                    setOrders(prev => [data as TshirtOrderItem, ...prev])
                }
                showMessage(`Nova camiseta para ${formName} adicionada com sucesso!`)
            }

            closeFormModal()
        } catch (err: any) {
            showMessage('Erro ao salvar: ' + err.message, 'error')
        }
    }

    // Excluir Pedido
    const handleDeleteOrder = async (item: TshirtOrderItem) => {
        if (!confirm(`Tem certeza que deseja excluir a camiseta de "${item.name}"?`)) return

        try {
            const { error } = await supabase
                .from('tshirt_orders')
                .delete()
                .eq('id', item.id)

            if (error) throw error

            setOrders(prev => prev.filter(o => o.id !== item.id))
            showMessage(`Camiseta de ${item.name} removida.`, 'success')
        } catch (err: any) {
            showMessage('Erro ao excluir: ' + err.message, 'error')
        }
    }

    const openEditModal = (item: TshirtOrderItem) => {
        setEditingItem(item)
        setFormName(item.name)
        setFormCategory(item.category)
        setFormSize(item.size)
        setFormStatus(item.status)
        setFormAmount(item.amount || 50)
        setFormPaymentMethod(item.payment_method || 'PIX')
        setFormPhone(item.phone || '')
        setFormNotes(item.notes || '')
        setIsAddModalOpen(true)
    }

    const closeFormModal = () => {
        setIsAddModalOpen(false)
        setEditingItem(null)
        setFormName('')
        setFormPhone('')
        setFormNotes('')
        setFormAmount(50)
    }

    // Seleção de todas as linhas filtradas
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredOrders.map(o => o.id))
        } else {
            setSelectedIds([])
        }
    }

    const handleToggleSelectOne = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        )
    }

    // Filtragem
    const filteredOrders = useMemo(() => {
        return orders.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
                (item.phone && item.phone.includes(searchTerm.trim())) ||
                (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase().trim()))

            const matchesCategory = filterCategory === 'Todos' || item.category === filterCategory
            const matchesSize = filterSize === 'Todos' || item.size === filterSize
            const matchesStatus = filterStatus === 'Todos' || item.status === filterStatus

            return matchesSearch && matchesCategory && matchesSize && matchesStatus
        })
    }, [orders, searchTerm, filterCategory, filterSize, filterStatus])

    // Grade de Tamanhos
    const sizeStats = useMemo(() => {
        const stats: Record<string, { paid: number; pending: number; total: number }> = {}
        SIZES_ORDER.forEach(s => {
            stats[s] = { paid: 0, pending: 0, total: 0 }
        })

        orders.forEach(item => {
            if (!stats[item.size]) {
                stats[item.size] = { paid: 0, pending: 0, total: 0 }
            }
            if (item.status === 'Pago') {
                stats[item.size].paid++
            } else {
                stats[item.size].pending++
            }
            stats[item.size].total++
        })

        return stats
    }, [orders])

    // Totais Gerais
    const totalPaid = useMemo(() => orders.filter(o => o.status === 'Pago').length, [orders])
    const totalPending = useMemo(() => orders.filter(o => o.status === 'Pendente').length, [orders])
    const totalAll = orders.length

    // Exportação CSV
    const exportCSV = () => {
        const headers = ['#', 'Nome', 'Categoria', 'Tamanho', 'Status Pagamento', 'Forma Pagamento', 'Valor (R$)', 'Telefone', 'Observações']
        const rows = filteredOrders.map((item, idx) => [
            idx + 1,
            `"${item.name}"`,
            `"${item.category}"`,
            `"${item.size}"`,
            `"${item.status}"`,
            `"${item.payment_method || 'PIX'}"`,
            `"${item.amount || 50}"`,
            `"${item.phone || ''}"`,
            `"${item.notes || ''}"`
        ])

        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', `camisetas_adonai_2026_${new Date().toISOString().slice(0, 10)}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
            {/* NOTIFICAÇÃO TOAST FLUTUANTE */}
            <AnimatePresence>
                {actionMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md ${
                            actionMessage.type === 'success'
                                ? 'bg-green-500/20 border-green-500/40 text-green-300'
                                : 'bg-red-500/20 border-red-500/40 text-red-300'
                        }`}
                    >
                        {actionMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <span className="font-bold text-sm">{actionMessage.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CABEÇALHO PRINCIPAL */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-holi-surface/80 border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-md">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-holi-primary to-purple-600 flex items-center justify-center text-white shadow-lg shadow-holi-primary/30">
                            <Shirt size={26} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                                Gestão de Camisetas • ADONAI 2026
                            </h1>
                            <p className="text-gray-400 text-xs md:text-sm">
                                Controle de pagamentos, confecção e vendas em tempo real.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={loadOrders}
                        disabled={loading}
                        className="p-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-2xl transition-colors border border-white/10 cursor-pointer"
                        title="Atualizar lista"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin text-holi-primary' : ''} />
                    </button>
                    <button
                        onClick={() => {
                            setEditingItem(null)
                            setIsAddModalOpen(true)
                        }}
                        className="px-5 py-3 bg-gradient-to-r from-holi-primary to-purple-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-holi-primary/30 cursor-pointer"
                    >
                        <Plus size={16} /> Adicionar Camiseta
                    </button>
                    <button
                        onClick={exportCSV}
                        className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                        <Download size={16} /> CSV
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                        <Printer size={16} /> Imprimir
                    </button>
                </div>
            </div>

            {/* CARDS DE RESUMO TOTALIZADORES */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-holi-surface border border-green-500/20 p-6 rounded-3xl relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-green-400 text-xs uppercase font-bold tracking-wider block mb-1">
                                ✅ Pagas & Confirmadas
                            </span>
                            <div className="text-4xl font-black text-white">{totalPaid}</div>
                            <span className="text-xs text-gray-400 mt-1 block">Produção garantida</span>
                        </div>
                        <div className="p-3 bg-green-500/10 rounded-2xl text-green-400 border border-green-500/20">
                            <CheckCircle size={28} />
                        </div>
                    </div>
                </div>

                <div className="bg-holi-surface border border-amber-500/20 p-6 rounded-3xl relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-amber-400 text-xs uppercase font-bold tracking-wider block mb-1">
                                ⏳ Pendentes de Pagamento
                            </span>
                            <div className="text-4xl font-black text-white">{totalPending}</div>
                            <span className="text-xs text-gray-400 mt-1 block">Clique no botão para marcar Pago</span>
                        </div>
                        <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/20">
                            <AlertCircle size={28} />
                        </div>
                    </div>
                </div>

                <div className="bg-holi-surface border border-purple-500/20 p-6 rounded-3xl relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-holi-secondary text-xs uppercase font-bold tracking-wider block mb-1">
                                📦 Total Geral Previsto
                            </span>
                            <div className="text-4xl font-black text-white">{totalAll}</div>
                            <span className="text-xs text-gray-400 mt-1 block">Demanda máxima para confecção</span>
                        </div>
                        <div className="p-3 bg-holi-secondary/10 rounded-2xl text-holi-secondary border border-holi-secondary/20">
                            <Shirt size={28} />
                        </div>
                    </div>
                </div>
            </div>

            {/* GRADE DE CONFECÇÃO VISUAL POR TAMANHO */}
            <div className="bg-holi-surface border border-white/10 p-6 md:p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg md:text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
                        <Shirt className="text-holi-secondary" size={22} /> Grade de Confecção por Tamanho
                    </h3>
                    <span className="text-xs text-gray-400 font-mono">
                        (Clique num tamanho para filtrar)
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                    {SIZES_ORDER.map(size => {
                        const s = sizeStats[size] || { paid: 0, pending: 0, total: 0 }
                        return (
                            <div
                                key={size}
                                onClick={() => setFilterSize(filterSize === size ? 'Todos' : size)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer text-center ${
                                    filterSize === size
                                        ? 'bg-holi-primary/20 border-holi-primary shadow-lg shadow-holi-primary/20 scale-105'
                                        : 'bg-black/40 border-white/10 hover:border-white/20'
                                }`}
                            >
                                <span className="text-xs font-mono font-bold text-gray-400 block mb-1">
                                    Tam {size}
                                </span>
                                <div className="text-2xl font-black text-white mb-2">
                                    {s.total}
                                </div>
                                <div className="flex justify-center gap-2 text-[10px] font-bold border-t border-white/5 pt-1.5">
                                    <span className="text-green-400" title="Pagos">{s.paid} pagos</span>
                                    {s.pending > 0 && (
                                        <span className="text-amber-400" title="Pendentes">+{s.pending} pend.</span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* BARRA DE FERRAMENTAS & FILTROS */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-holi-surface/60 p-4 border border-white/10 rounded-2xl">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                    {/* Busca */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome, telefone ou anotação..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-holi-primary"
                        />
                    </div>

                    {/* Filtro Categoria */}
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-black/40 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-holi-primary"
                    >
                        <option value="Todos">Categoria: Todas</option>
                        <option value="Participante">Apenas Participantes</option>
                        <option value="Anjo">Apenas Anjos</option>
                        <option value="Avulso">Apenas Vendas Avulsas</option>
                    </select>

                    {/* Filtro Tamanho */}
                    <select
                        value={filterSize}
                        onChange={(e) => setFilterSize(e.target.value)}
                        className="bg-black/40 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-holi-primary"
                    >
                        <option value="Todos">Tamanho: Todos</option>
                        {SIZES_ORDER.map(s => (
                            <option key={s} value={s}>Tamanho {s}</option>
                        ))}
                    </select>

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
                </div>

                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 self-start md:self-auto">
                    <button
                        onClick={() => setActiveTab('list')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'list' ? 'bg-holi-primary text-white shadow-md' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Lista Detalhada ({filteredOrders.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('production')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'production' ? 'bg-holi-primary text-white shadow-md' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Guia da Gráfica
                    </button>
                </div>
            </div>

            {/* BARRA DE AÇÕES EM MASSA (quando há itens selecionados) */}
            {selectedIds.length > 0 && (
                <div className="bg-gradient-to-r from-holi-primary/20 to-purple-600/20 border border-holi-primary/40 p-4 rounded-2xl flex items-center justify-between gap-4">
                    <span className="text-sm font-bold text-white">
                        {selectedIds.length} camisetas selecionadas
                    </span>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBulkMarkPaid}
                            disabled={bulkUpdating}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-black text-xs uppercase rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-green-500/20"
                        >
                            {bulkUpdating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                            Marcar como PAGO
                        </button>
                        <button
                            onClick={() => setSelectedIds([])}
                            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
                        >
                            Limpar Seleção
                        </button>
                    </div>
                </div>
            )}

            {/* TAB 1: LISTA DETALHADA COM GESTÃO DE PAGAMENTO */}
            {activeTab === 'list' && (
                <div className="bg-holi-surface border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    {loading ? (
                        <div className="py-20 text-center">
                            <Loader2 className="w-10 h-10 animate-spin text-holi-primary mx-auto mb-3" />
                            <p className="text-gray-400 text-sm">Carregando pedidos de camisetas...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="py-20 text-center text-gray-400">
                            <Shirt className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-lg font-bold text-white mb-1">Nenhum pedido encontrado</p>
                            <p className="text-sm">Tente ajustar seus filtros de busca.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 bg-black/40 text-[11px] uppercase tracking-wider text-gray-400">
                                        <th className="py-4 px-4 text-center w-10">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.length === filteredOrders.length && filteredOrders.length > 0}
                                                onChange={handleSelectAll}
                                                className="rounded bg-black/40 border-white/20 text-holi-primary focus:ring-0 cursor-pointer"
                                            />
                                        </th>
                                        <th className="py-4 px-4">Nome</th>
                                        <th className="py-4 px-4">Categoria</th>
                                        <th className="py-4 px-4 text-center">Tamanho</th>
                                        <th className="py-4 px-4">Status Pagamento (Clique p/ Mudar)</th>
                                        <th className="py-4 px-4">Forma Pagto</th>
                                        <th className="py-4 px-4">Contato / Detalhes</th>
                                        <th className="py-4 px-6 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {filteredOrders.map((item, idx) => {
                                        const isSelected = selectedIds.includes(item.id)
                                        const isSaving = savingId === item.id

                                        return (
                                            <tr
                                                key={item.id}
                                                className={`hover:bg-white/[0.02] transition-colors group ${
                                                    isSelected ? 'bg-holi-primary/5' : ''
                                                }`}
                                            >
                                                {/* CHECKBOX SELEÇÃO */}
                                                <td className="py-4 px-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleToggleSelectOne(item.id)}
                                                        className="rounded bg-black/40 border-white/20 text-holi-primary focus:ring-0 cursor-pointer"
                                                    />
                                                </td>

                                                {/* NOME */}
                                                <td className="py-4 px-4">
                                                    <div className="font-bold text-white flex items-center gap-2">
                                                        {item.name}
                                                    </div>
                                                </td>

                                                {/* CATEGORIA */}
                                                <td className="py-4 px-4">
                                                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                                                        item.category === 'Participante'
                                                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                            : item.category === 'Anjo'
                                                                ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                                                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                    }`}>
                                                        {item.category}
                                                    </span>
                                                </td>

                                                {/* TAMANHO */}
                                                <td className="py-4 px-4 text-center">
                                                    <span className="inline-block px-3 py-1 rounded-xl bg-white/10 text-holi-secondary font-mono font-black text-sm border border-white/10">
                                                        {item.size}
                                                    </span>
                                                </td>

                                                {/* STATUS DE PAGAMENTO COM TOGGLE RÁPIDO */}
                                                <td className="py-4 px-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => togglePaymentStatus(item)}
                                                        disabled={isSaving}
                                                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm ${
                                                            item.status === 'Pago'
                                                                ? 'bg-green-500/20 text-green-400 border border-green-500/40 hover:bg-green-500/30'
                                                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 hover:scale-105'
                                                        }`}
                                                        title="Clique para alternar Pago / Pendente"
                                                    >
                                                        {isSaving ? (
                                                            <Loader2 size={12} className="animate-spin" />
                                                        ) : item.status === 'Pago' ? (
                                                            <CheckCircle size={13} />
                                                        ) : (
                                                            <AlertCircle size={13} />
                                                        )}
                                                        <span>{item.status}</span>
                                                    </button>
                                                </td>

                                                {/* FORMA DE PAGAMENTO */}
                                                <td className="py-4 px-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => setPaymentModalItem(item)}
                                                        className="text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                                                        title="Alterar método de pagamento"
                                                    >
                                                        {item.payment_method === 'Dinheiro' && <Banknote size={12} className="text-emerald-400" />}
                                                        {item.payment_method === 'Cartão' && <CreditCard size={12} className="text-blue-400" />}
                                                        {(!item.payment_method || item.payment_method === 'PIX') && <DollarSign size={12} className="text-cyan-400" />}
                                                        <span>{item.payment_method || 'PIX'}</span>
                                                    </button>
                                                </td>

                                                {/* DETALHES / CONTATO */}
                                                <td className="py-4 px-4 text-xs text-gray-400">
                                                    <div className="flex flex-col">
                                                        {item.phone && <span className="text-gray-300">{item.phone}</span>}
                                                        {item.notes && <span className="text-gray-500 truncate max-w-[180px]">{item.notes}</span>}
                                                    </div>
                                                </td>

                                                {/* AÇÕES (EDITAR / EXCLUIR) */}
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(item)}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                                            title="Editar Camiseta"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteOrder(item)}
                                                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                                            title="Excluir"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: GUIA DE PRODUÇÃO / CONFECÇÃO */}
            {activeTab === 'production' && (
                <div className="space-y-6">
                    <div className="bg-holi-surface border border-white/10 p-6 md:p-8 rounded-3xl">
                        <div className="flex items-center gap-3 mb-6">
                            <FileText className="text-holi-primary" size={24} />
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                                    Resumo Oficial para a Estamparia / Gráfica
                                </h3>
                                <p className="text-gray-400 text-xs">
                                    Contagem exata por tamanho para confecção das camisetas do Retiro ADONAI 2026.
                                </p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 bg-black/40 text-xs uppercase tracking-wider text-gray-400">
                                        <th className="py-3 px-4">Tamanho</th>
                                        <th className="py-3 px-4 text-center">Garantido (Já Pago)</th>
                                        <th className="py-3 px-4 text-center">Pendente</th>
                                        <th className="py-3 px-4 text-right font-black">Total Previsto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 font-mono text-sm">
                                    {SIZES_ORDER.map(s => {
                                        const stat = sizeStats[s] || { paid: 0, pending: 0, total: 0 }
                                        return (
                                            <tr key={s} className="hover:bg-white/[0.02]">
                                                <td className="py-3 px-4 font-bold text-white">Tamanho {s}</td>
                                                <td className="py-3 px-4 text-center text-green-400 font-bold">{stat.paid}</td>
                                                <td className="py-3 px-4 text-center text-amber-400">{stat.pending}</td>
                                                <td className="py-3 px-4 text-right font-black text-holi-secondary text-base">{stat.total}</td>
                                            </tr>
                                        )
                                    })}
                                    <tr className="border-t-2 border-white/20 bg-white/5 font-bold text-base">
                                        <td className="py-4 px-4 text-white uppercase">TOTAL GERAL</td>
                                        <td className="py-4 px-4 text-center text-green-400">{totalPaid}</td>
                                        <td className="py-4 px-4 text-center text-amber-400">{totalPending}</td>
                                        <td className="py-4 px-4 text-right font-black text-holi-secondary text-xl">{totalAll} peças</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: PAGAMENTO RÁPIDO */}
            <AnimatePresence>
                {paymentModalItem && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-holi-surface border border-white/10 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative"
                        >
                            <button
                                onClick={() => setPaymentModalItem(null)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400">
                                    <DollarSign size={22} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white">Confirmar Pagamento</h3>
                                    <p className="text-xs text-gray-400">{paymentModalItem.name} ({paymentModalItem.size})</p>
                                </div>
                            </div>

                            <div className="space-y-4 my-6">
                                <label className="block text-xs font-bold uppercase text-gray-400">
                                    Forma de Pagamento
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['PIX', 'Dinheiro', 'Cartão', 'Outro'] as const).map(m => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => setQuickMethod(m)}
                                            className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                                quickMethod === m
                                                    ? 'bg-holi-primary text-white border-holi-primary shadow-lg shadow-holi-primary/20'
                                                    : 'bg-black/40 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                                            }`}
                                        >
                                            {m === 'PIX' && <DollarSign size={14} />}
                                            {m === 'Dinheiro' && <Banknote size={14} />}
                                            {m === 'Cartão' && <CreditCard size={14} />}
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setPaymentModalItem(null)}
                                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmQuickPayment}
                                    className="px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-black font-black text-xs uppercase cursor-pointer shadow-lg shadow-green-500/20"
                                >
                                    Salvar como PAGO
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL: ADICIONAR / EDITAR CAMISETA */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-holi-surface border border-white/10 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative"
                        >
                            <button
                                onClick={closeFormModal}
                                className="absolute top-6 right-6 text-gray-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-holi-primary/20 border border-holi-primary/30 flex items-center justify-center text-holi-primary">
                                    {editingItem ? <Edit3 size={20} /> : <Plus size={20} />}
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                                    {editingItem ? 'Editar Camiseta' : 'Adicionar Camiseta'}
                                </h3>
                            </div>

                            <form onSubmit={handleSaveOrder} className="space-y-4 text-sm">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                                        Nome Completo
                                    </label>
                                    <input
                                        type="text"
                                        value={formName}
                                        onChange={e => setFormName(e.target.value)}
                                        placeholder="Ex: João da Silva"
                                        required
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-holi-primary"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                                            Categoria
                                        </label>
                                        <select
                                            value={formCategory}
                                            onChange={e => setFormCategory(e.target.value as any)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-holi-primary"
                                        >
                                            <option value="Avulso">Venda Avulsa</option>
                                            <option value="Anjo">Anjo / Equipe</option>
                                            <option value="Participante">Participante</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                                            Tamanho
                                        </label>
                                        <select
                                            value={formSize}
                                            onChange={e => setFormSize(e.target.value as any)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-holi-primary font-mono font-bold"
                                        >
                                            {SIZES_ORDER.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                                            Status Pagamento
                                        </label>
                                        <select
                                            value={formStatus}
                                            onChange={e => setFormStatus(e.target.value as any)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-holi-primary"
                                        >
                                            <option value="Pago">✅ Já Pago</option>
                                            <option value="Pendente">⏳ Pendente</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                                            Forma Pagamento
                                        </label>
                                        <select
                                            value={formPaymentMethod}
                                            onChange={e => setFormPaymentMethod(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-holi-primary"
                                        >
                                            <option value="PIX">PIX</option>
                                            <option value="Dinheiro">Dinheiro</option>
                                            <option value="Cartão">Cartão</option>
                                            <option value="Outro">Outro</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                                            Valor (R$)
                                        </label>
                                        <input
                                            type="number"
                                            value={formAmount}
                                            onChange={e => setFormAmount(Number(e.target.value))}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-holi-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                                            Telefone (Opcional)
                                        </label>
                                        <input
                                            type="text"
                                            value={formPhone}
                                            onChange={e => setFormPhone(e.target.value)}
                                            placeholder="(17) 99999-9999"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-holi-primary"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                                        Observações / Detalhes
                                    </label>
                                    <input
                                        type="text"
                                        value={formNotes}
                                        onChange={e => setFormNotes(e.target.value)}
                                        placeholder="Ex: Entregue em mãos / Pago para fulano"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-holi-primary"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={closeFormModal}
                                        className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase cursor-pointer"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 rounded-xl bg-holi-primary hover:bg-holi-primary/80 text-white font-black text-xs uppercase cursor-pointer shadow-lg shadow-holi-primary/30"
                                    >
                                        {editingItem ? 'Atualizar Pedido' : 'Salvar Pedido'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
