import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Calendar, Clock, Plus, Trash2, Edit3, Sparkles,
    Utensils, Moon, Sun, Heart, Church,
    CheckCircle2, AlertCircle, RefreshCw, X, Save,
    ChevronUp, ChevronDown, Flame
} from 'lucide-react'
import { scheduleService } from '@/services/scheduleService'
import { DaySchedule, ScheduleItem, ScheduleCategory, CreateScheduleItemDTO } from '@/types/schedule'

const CATEGORY_CONFIG: Record<
    ScheduleCategory,
    { label: string; icon: React.ReactNode; bg: string; border: string; text: string }
> = {
    welcome: {
        label: 'Acolhida / Destaque',
        icon: <Sun size={15} className="text-yellow-400" />,
        bg: 'bg-yellow-400/10',
        border: 'border-yellow-400/30',
        text: 'text-yellow-300'
    },
    meal: {
        label: 'Refeição',
        icon: <Utensils size={15} className="text-emerald-400" />,
        bg: 'bg-emerald-400/10',
        border: 'border-emerald-400/30',
        text: 'text-emerald-300'
    },
    prayer: {
        label: 'Oração / Adoração',
        icon: <Heart size={15} className="text-pink-400" />,
        bg: 'bg-pink-400/10',
        border: 'border-pink-400/30',
        text: 'text-pink-300'
    },
    activity: {
        label: 'Atividade Geral',
        icon: <Sparkles size={15} className="text-cyan-400" />,
        bg: 'bg-cyan-400/10',
        border: 'border-cyan-400/30',
        text: 'text-cyan-300'
    },
    break: {
        label: 'Intervalo',
        icon: <Clock size={15} className="text-gray-400" />,
        bg: 'bg-gray-400/10',
        border: 'border-gray-400/30',
        text: 'text-gray-300'
    },
    mass: {
        label: 'Missa Solene',
        icon: <Church size={15} className="text-amber-400" />,
        bg: 'bg-amber-400/10',
        border: 'border-amber-400/30',
        text: 'text-amber-300'
    },
    rest: {
        label: 'Descanso / Pessoal',
        icon: <Moon size={15} className="text-purple-400" />,
        bg: 'bg-purple-400/10',
        border: 'border-purple-400/30',
        text: 'text-purple-300'
    }
}

export const ScheduleAdmin: React.FC = () => {
    const [days, setDays] = useState<DaySchedule[]>([])
    const [selectedDayId, setSelectedDayId] = useState<string>('todos')
    const [loading, setLoading] = useState<boolean>(true)
    const [actionLoading, setActionLoading] = useState<boolean>(false)
    const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // Modal de Criação / Edição de Item
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null)
    const [itemForm, setItemForm] = useState<{
        day_id: string
        time: string
        title: string
        category: ScheduleCategory
        highlight: boolean
    }>({
        day_id: 'sexta',
        time: '',
        title: '',
        category: 'activity',
        highlight: false
    })

    // Modal de Edição do Dia
    const [editingDay, setEditingDay] = useState<DaySchedule | null>(null)
    const [dayForm, setDayForm] = useState<{
        day_name: string
        date_text: string
        subtitle: string
        tag: string
    }>({
        day_name: '',
        date_text: '',
        subtitle: '',
        tag: ''
    })

    useEffect(() => {
        loadSchedule()
    }, [])

    const loadSchedule = async () => {
        setLoading(true)
        const { data, error } = await scheduleService.getSchedule()
        if (error) {
            showFeedback('error', 'Erro ao carregar dados do Supabase. Carregando dados locais.')
        }
        setDays(data)
        if (selectedDayId === 'todos' && data.length > 0) {
            // Mantém todos ou seleciona o primeiro
        }
        setLoading(false)
    }

    const showFeedback = (type: 'success' | 'error', text: string) => {
        setFeedbackMessage({ type, text })
        setTimeout(() => {
            setFeedbackMessage(null)
        }, 4000)
    }

    const handleOpenCreateModal = (defaultDayId?: string) => {
        setEditingItem(null)
        setItemForm({
            day_id: defaultDayId && defaultDayId !== 'todos' ? defaultDayId : days[0]?.id || 'sexta',
            time: '',
            title: '',
            category: 'activity',
            highlight: false
        })
        setIsModalOpen(true)
    }

    const handleOpenEditModal = (item: ScheduleItem) => {
        setEditingItem(item)
        setItemForm({
            day_id: item.day_id,
            time: item.time,
            title: item.title,
            category: item.category,
            highlight: item.highlight
        })
        setIsModalOpen(true)
    }

    const handleSaveItem = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!itemForm.time.trim() || !itemForm.title.trim()) {
            showFeedback('error', 'Preencha o horário e o título da atividade.')
            return
        }

        setActionLoading(true)

        if (editingItem) {
            // Atualização
            const { error } = await scheduleService.updateItem(editingItem.id, {
                time: itemForm.time.trim(),
                title: itemForm.title.trim(),
                category: itemForm.category,
                highlight: itemForm.highlight
            })

            if (error) {
                showFeedback('error', 'Falha ao atualizar o horário: ' + error.message)
            } else {
                showFeedback('success', 'Horário atualizado com sucesso!')
                setIsModalOpen(false)
                loadSchedule()
            }
        } else {
            // Criação
            const currentDayEvents = days.find(d => d.id === itemForm.day_id)?.events || []
            const newOrder = currentDayEvents.length + 1

            const payload: CreateScheduleItemDTO = {
                day_id: itemForm.day_id,
                time: itemForm.time.trim(),
                title: itemForm.title.trim(),
                category: itemForm.category,
                highlight: itemForm.highlight,
                order_num: newOrder
            }

            const { error } = await scheduleService.createItem(payload)
            if (error) {
                showFeedback('error', 'Falha ao adicionar horário: ' + error.message)
            } else {
                showFeedback('success', 'Nova atividade adicionada com sucesso!')
                setIsModalOpen(false)
                loadSchedule()
            }
        }
        setActionLoading(false)
    }

    const handleDeleteItem = async (id: string, title: string) => {
        if (!window.confirm(`Tem certeza que deseja remover "${title}" do cronograma?`)) {
            return
        }

        setActionLoading(true)
        const { success, error } = await scheduleService.deleteItem(id)
        if (success) {
            showFeedback('success', 'Atividade removida com sucesso!')
            loadSchedule()
        } else {
            showFeedback('error', 'Erro ao excluir: ' + (error?.message || 'Tente novamente.'))
        }
        setActionLoading(false)
    }

    const handleToggleHighlight = async (item: ScheduleItem) => {
        const newStatus = !item.highlight
        // Atualização otimista
        setDays(prev =>
            prev.map(day => {
                if (day.id !== item.day_id) return day
                return {
                    ...day,
                    events: day.events.map(ev => (ev.id === item.id ? { ...ev, highlight: newStatus } : ev))
                }
            })
        )

        const { error } = await scheduleService.updateItem(item.id, { highlight: newStatus })
        if (error) {
            showFeedback('error', 'Erro ao alterar destaque.')
            loadSchedule()
        } else {
            showFeedback('success', newStatus ? 'Atividade destacada!' : 'Destaque removido.')
        }
    }

    const handleMoveOrder = async (dayId: string, itemIdx: number, direction: 'up' | 'down') => {
        const targetDay = days.find(d => d.id === dayId)
        if (!targetDay) return

        const events = [...targetDay.events]
        const swapIdx = direction === 'up' ? itemIdx - 1 : itemIdx + 1
        if (swapIdx < 0 || swapIdx >= events.length) return

        const currentItem = events[itemIdx]
        const targetItem = events[swapIdx]

        // Troca posições
        events[itemIdx] = targetItem
        events[swapIdx] = currentItem

        // Atualização otimista
        setDays(prev =>
            prev.map(d => (d.id === dayId ? { ...d, events } : d))
        )

        // Salva novas ordens no banco
        await Promise.all([
            scheduleService.updateItem(currentItem.id, { order_num: swapIdx + 1 }),
            scheduleService.updateItem(targetItem.id, { order_num: itemIdx + 1 })
        ])
    }

    const handleOpenEditDay = (day: DaySchedule) => {
        setEditingDay(day)
        setDayForm({
            day_name: day.day_name,
            date_text: day.date_text,
            subtitle: day.subtitle,
            tag: day.tag
        })
    }

    const handleSaveDay = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingDay) return

        setActionLoading(true)
        const { error } = await scheduleService.updateDay(editingDay.id, dayForm)
        if (error) {
            showFeedback('error', 'Erro ao salvar informações do dia: ' + error.message)
        } else {
            showFeedback('success', 'Informações do dia atualizadas com sucesso!')
            setEditingDay(null)
            loadSchedule()
        }
        setActionLoading(false)
    }

    const displayedDays = selectedDayId === 'todos'
        ? days
        : days.filter(d => d.id === selectedDayId)

    const totalEventsCount = days.reduce((acc, curr) => acc + curr.events.length, 0)

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen text-white">
            {/* TOAST / FEEDBACK */}
            <AnimatePresence>
                {feedbackMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${
                            feedbackMessage.type === 'success'
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                : 'bg-red-500/20 border-red-500/50 text-red-300'
                        }`}
                    >
                        {feedbackMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <span className="font-bold text-sm">{feedbackMessage.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CABEÇALHO */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10">
                <div>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-holi-primary/20 border border-holi-primary/30 text-xs font-mono tracking-widest uppercase text-holi-primary mb-3">
                        <Calendar size={14} />
                        <span>Gestão de Cronograma</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                        Programação do Retiro
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Gerencie todos os horários, celebrações e atividades exibidos na página pública.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={loadSchedule}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-all"
                        title="Recarregar dados do Supabase"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        <span>Atualizar</span>
                    </button>

                    <button
                        onClick={() => handleOpenCreateModal(selectedDayId)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-holi-primary to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-holi-primary/25 border border-white/20 transition-all hover:scale-105"
                    >
                        <Plus size={18} />
                        <span>Novo Horário / Atividade</span>
                    </button>
                </div>
            </div>

            {/* RESUMO & FILTRO DE DIAS */}
            <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setSelectedDayId('todos')}
                        className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${
                            selectedDayId === 'todos'
                                ? 'bg-white text-black border-white shadow-lg'
                                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        Todos os Dias ({totalEventsCount})
                    </button>

                    {days.map(day => (
                        <button
                            key={day.id}
                            onClick={() => setSelectedDayId(day.id)}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${
                                selectedDayId === day.id
                                    ? 'bg-gradient-to-r from-holi-primary to-purple-600 text-white border-holi-primary shadow-lg shadow-holi-primary/30'
                                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {day.day_name} ({day.events.length})
                        </button>
                    ))}
                </div>

                <div className="text-xs font-mono uppercase text-gray-500">
                    {totalEventsCount} atividades cadastradas no total
                </div>
            </div>

            {/* CONTEÚDO / DIAS */}
            {loading ? (
                <div className="py-32 text-center text-gray-400 font-mono flex flex-col items-center justify-center gap-4">
                    <RefreshCw className="animate-spin text-holi-primary" size={36} />
                    <p className="text-sm">Carregando cronograma do Supabase...</p>
                </div>
            ) : displayedDays.length === 0 ? (
                <div className="py-20 text-center bg-white/5 rounded-3xl border border-white/10 mt-8 p-8">
                    <p className="text-gray-400 text-sm">Nenhum dia ou atividade encontrada.</p>
                </div>
            ) : (
                <div className="mt-8 space-y-12">
                    {displayedDays.map(day => (
                        <div
                            key={day.id}
                            className="bg-[#0e0717]/90 border border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden"
                        >
                            {/* Header do Card do Dia */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-white/10 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="bg-gradient-to-r from-holi-primary to-purple-600 text-white font-marker text-2xl px-5 py-2 rounded-2xl shadow-lg border-2 border-black">
                                        {day.tag}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                                                {day.day_name}
                                            </h2>
                                            <button
                                                onClick={() => handleOpenEditDay(day)}
                                                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all text-xs flex items-center gap-1 border border-white/10"
                                                title="Editar cabeçalho do dia"
                                            >
                                                <Edit3 size={13} />
                                                <span className="text-[10px] uppercase font-bold">Editar Dia</span>
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400 font-medium mt-0.5">
                                            {day.date_text} • <span className="text-holi-secondary">{day.subtitle}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleOpenCreateModal(day.id)}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase rounded-xl border border-white/15 transition-all"
                                    >
                                        <Plus size={15} />
                                        <span>Adicionar neste dia</span>
                                    </button>
                                    <span className="text-xs font-mono uppercase text-gray-500 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                                        {day.events.length} itens
                                    </span>
                                </div>
                            </div>

                            {/* Lista de Atividades do Dia */}
                            {day.events.length === 0 ? (
                                <div className="py-12 text-center text-gray-500 font-mono text-xs">
                                    Nenhuma atividade agendada para este dia.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {day.events.map((event, idx) => {
                                        const cat = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.activity

                                        return (
                                            <div
                                                key={event.id}
                                                className={`p-4 md:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border transition-all ${
                                                    event.highlight
                                                        ? 'bg-white/10 border-holi-primary/50 shadow-md shadow-holi-primary/10'
                                                        : 'bg-black/40 border-white/5 hover:border-white/15'
                                                }`}
                                            >
                                                {/* Reordenação + Horário */}
                                                <div className="flex items-center gap-3 shrink-0">
                                                    {/* Botões Subir/Descer */}
                                                    <div className="flex flex-col gap-1">
                                                        <button
                                                            onClick={() => handleMoveOrder(day.id, idx, 'up')}
                                                            disabled={idx === 0}
                                                            className="p-1 rounded bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent"
                                                            title="Subir posição"
                                                        >
                                                            <ChevronUp size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleMoveOrder(day.id, idx, 'down')}
                                                            disabled={idx === day.events.length - 1}
                                                            className="p-1 rounded bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent"
                                                            title="Descer posição"
                                                        >
                                                            <ChevronDown size={14} />
                                                        </button>
                                                    </div>

                                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-holi-secondary shrink-0">
                                                        <Clock size={18} />
                                                    </div>

                                                    <span className="font-mono font-black text-lg md:text-xl text-white tracking-tight min-w-[85px]">
                                                        {event.time}
                                                    </span>
                                                </div>

                                                {/* Título */}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className={`text-base md:text-lg font-bold uppercase tracking-wide ${
                                                            event.highlight ? 'text-[#fff53c]' : 'text-gray-100'
                                                        }`}>
                                                            {event.title}
                                                        </h3>
                                                        {event.highlight && (
                                                            <span className="px-2 py-0.5 rounded-md bg-yellow-400/20 border border-yellow-400/40 text-[#fff53c] text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                                                                <Flame size={12} /> Destaque
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Badge da Categoria */}
                                                <div className="shrink-0">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cat.bg} ${cat.border} ${cat.text}`}>
                                                        {cat.icon}
                                                        <span>{cat.label}</span>
                                                    </span>
                                                </div>

                                                {/* Ações */}
                                                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
                                                    <button
                                                        onClick={() => handleToggleHighlight(event)}
                                                        className={`p-2.5 rounded-xl border transition-all ${
                                                            event.highlight
                                                                ? 'bg-yellow-400/20 border-yellow-400/50 text-yellow-300'
                                                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-yellow-300 hover:bg-white/10'
                                                        }`}
                                                        title={event.highlight ? 'Remover destaque visual' : 'Marcar como destaque visual'}
                                                    >
                                                        <Flame size={16} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleOpenEditModal(event)}
                                                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-gray-300 hover:text-white transition-all"
                                                        title="Editar horário e título"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteItem(event.id, event.title)}
                                                        className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 hover:text-red-300 transition-all"
                                                        title="Excluir atividade"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL DE CRIAÇÃO / EDIÇÃO DE ITEM */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !actionLoading && setIsModalOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-[#12081f] border border-white/20 rounded-3xl p-6 sm:p-8 max-w-lg w-full relative z-10 shadow-2xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-holi-primary/20 rounded-2xl text-holi-primary">
                                        <Clock size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase text-white">
                                            {editingItem ? 'Editar Atividade' : 'Nova Atividade'}
                                        </h3>
                                        <p className="text-xs text-gray-400 font-mono">
                                            {editingItem ? 'Altere os dados do cronograma' : 'Adicione um novo horário'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => !actionLoading && setIsModalOpen(false)}
                                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSaveItem} className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">
                                        Dia do Evento
                                    </label>
                                    <select
                                        value={itemForm.day_id}
                                        onChange={(e) => setItemForm({ ...itemForm, day_id: e.target.value })}
                                        disabled={!!editingItem}
                                        className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-holi-primary outline-none transition-all"
                                    >
                                        {days.map(d => (
                                            <option key={d.id} value={d.id} className="bg-gray-900 text-white">
                                                {d.day_name} ({d.tag})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="sm:col-span-1">
                                        <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">
                                            Horário
                                        </label>
                                        <input
                                            type="text"
                                            value={itemForm.time}
                                            onChange={(e) => setItemForm({ ...itemForm, time: e.target.value })}
                                            placeholder="Ex: 19h30"
                                            required
                                            className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 font-mono text-sm text-white focus:border-holi-primary outline-none transition-all"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">
                                            Categoria
                                        </label>
                                        <select
                                            value={itemForm.category}
                                            onChange={(e) => setItemForm({ ...itemForm, category: e.target.value as ScheduleCategory })}
                                            className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-holi-primary outline-none transition-all"
                                        >
                                            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                                                <option key={key} value={key} className="bg-gray-900 text-white">
                                                    {config.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">
                                        Título da Atividade / Descrição
                                    </label>
                                    <input
                                        type="text"
                                        value={itemForm.title}
                                        onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                                        placeholder="Ex: Momento de Louvor e Adoração"
                                        required
                                        className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-holi-primary outline-none transition-all"
                                    />
                                </div>

                                <div className="pt-2">
                                    <label className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={itemForm.highlight}
                                            onChange={(e) => setItemForm({ ...itemForm, highlight: e.target.checked })}
                                            className="w-4 h-4 rounded text-holi-primary focus:ring-0 focus:ring-offset-0 bg-black border-white/30"
                                        />
                                        <div>
                                            <span className="text-xs font-bold uppercase text-white block">
                                                Destacar visualmente no site
                                            </span>
                                            <span className="text-[10px] text-gray-400 block">
                                                Exibe a linha com fundo iluminado e texto em destaque amarelo
                                            </span>
                                        </div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        disabled={actionLoading}
                                        className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold text-xs uppercase transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-holi-primary hover:bg-fuchsia-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-fuchsia-500/25 transition-all"
                                    >
                                        <Save size={16} />
                                        <span>{actionLoading ? 'Salvando...' : 'Salvar Atividade'}</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL DE EDIÇÃO DO DIA */}
            <AnimatePresence>
                {editingDay && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !actionLoading && setEditingDay(null)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-[#12081f] border border-white/20 rounded-3xl p-6 sm:p-8 max-w-lg w-full relative z-10 shadow-2xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-holi-secondary/20 rounded-2xl text-holi-secondary">
                                        <Calendar size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase text-white">
                                            Editar Informações do Dia
                                        </h3>
                                        <p className="text-xs text-gray-400 font-mono">
                                            {editingDay.day_name} ({editingDay.tag})
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => !actionLoading && setEditingDay(null)}
                                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSaveDay} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">
                                            Nome do Dia
                                        </label>
                                        <input
                                            type="text"
                                            value={dayForm.day_name}
                                            onChange={(e) => setDayForm({ ...dayForm, day_name: e.target.value })}
                                            placeholder="Ex: Sexta-feira"
                                            required
                                            className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-holi-primary outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">
                                            Tag / Badge
                                        </label>
                                        <input
                                            type="text"
                                            value={dayForm.tag}
                                            onChange={(e) => setDayForm({ ...dayForm, tag: e.target.value })}
                                            placeholder="Ex: 25/09"
                                            required
                                            className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 font-mono text-sm text-white focus:border-holi-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">
                                        Data Completa
                                    </label>
                                    <input
                                        type="text"
                                        value={dayForm.date_text}
                                        onChange={(e) => setDayForm({ ...dayForm, date_text: e.target.value })}
                                        placeholder="Ex: 25 de Setembro de 2026"
                                        required
                                        className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-holi-primary outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">
                                        Subtítulo / Tema do Dia
                                    </label>
                                    <input
                                        type="text"
                                        value={dayForm.subtitle}
                                        onChange={(e) => setDayForm({ ...dayForm, subtitle: e.target.value })}
                                        placeholder="Ex: Acolhida & Início da Jornada"
                                        required
                                        className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:border-holi-primary outline-none transition-all"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setEditingDay(null)}
                                        disabled={actionLoading}
                                        className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold text-xs uppercase transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-holi-secondary hover:bg-cyan-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
                                    >
                                        <Save size={16} />
                                        <span>{actionLoading ? 'Salvando...' : 'Salvar Alterações'}</span>
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

export default ScheduleAdmin
