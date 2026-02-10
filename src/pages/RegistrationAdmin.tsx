import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Download, Users, CheckCircle,
    Shirt, UserCheck,
    X, Trash2, ChevronRight, Package, Activity, Loader2, Upload, ChevronDown
} from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Registration {
    id: string
    created_at: string
    email: string
    full_name: string
    phone: string
    parish: string
    payment_status: 'Pendente' | 'Pago' | 'Cancelado'
    assigned_angel: string | null
    tshirt_size: string | null
    tshirt_size_2: string | null
    kit_option: string
    city: string
    payment_amount: number
    birth_date: string
    payment_receipt_url: string | null
    gender: string | null
    address: string | null
    emergency_phone: string | null
    staying_on_site: boolean | null
}

const RegistrationAdmin = () => {
    const { userRole } = useOutletContext<{ userRole: 'admin' | 'redator' }>()

    const [registrations, setRegistrations] = useState<Registration[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('Todos')
    const [filterAngel, setFilterAngel] = useState('Todos')
    const [activeTab, setActiveTab] = useState<'list' | 'dashboard'>('list')
    const [editingReg, setEditingReg] = useState<Registration | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [uploadingReceipt, setUploadingReceipt] = useState(false)

    useEffect(() => {
        fetchRegistrations()
    }, [])

    const fetchRegistrations = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('event_registrations')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) console.error('Error fetching:', error)
        else setRegistrations(data || [])
        setLoading(false)
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('Esta ação removerá permanentemente a inscrição. Continuar?')) return

        setDeletingId(id)
        const { error } = await supabase
            .from('event_registrations')
            .delete()
            .eq('id', id)

        if (error) {
            alert('Erro ao excluir: ' + error.message)
        } else {
            setRegistrations(prev => prev.filter(r => r.id !== id))
        }
        setDeletingId(null)
    }

    const handleUpdateRegistration = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingReg) return
        setIsSaving(true)

        const { error } = await supabase
            .from('event_registrations')
            .update({
                payment_status: editingReg.payment_status,
                assigned_angel: editingReg.assigned_angel,
                payment_receipt_url: editingReg.payment_receipt_url,
                full_name: editingReg.full_name,
                email: editingReg.email,
                phone: editingReg.phone,
                emergency_phone: editingReg.emergency_phone,
                address: editingReg.address,
                city: editingReg.city,
                parish: editingReg.parish,
                tshirt_size: editingReg.tshirt_size,
                tshirt_size_2: editingReg.tshirt_size_2,
                staying_on_site: editingReg.staying_on_site,
                gender: editingReg.gender,
                birth_date: editingReg.birth_date,
                kit_option: editingReg.kit_option
            })
            .eq('id', editingReg.id)

        if (error) {
            alert('Erro ao atualizar: ' + error.message)
        } else {
            setRegistrations(prev => prev.map(r => r.id === editingReg.id ? editingReg : r))
            setEditingReg(null)
        }
        setIsSaving(false)
    }

    const handleAdminReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !editingReg) return

        const file = e.target.files[0]
        if (file.size > 5 * 1024 * 1024) {
            alert('O arquivo deve ter no máximo 5MB')
            return
        }

        setUploadingReceipt(true)

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}_${editingReg.email.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('pagamentos')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) throw new Error('Erro ao fazer upload: ' + uploadError.message)

            const { data: { publicUrl } } = supabase.storage
                .from('pagamentos')
                .getPublicUrl(filePath)

            setEditingReg({ ...editingReg, payment_receipt_url: publicUrl })

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
            reg.full_name.toLowerCase().includes(lowerSearch) ||
            reg.email.toLowerCase().includes(lowerSearch) ||
            (reg.phone || '').includes(lowerSearch) ||
            (reg.assigned_angel || '').toLowerCase().includes(lowerSearch)

        const matchesStatus = filterStatus === 'Todos' || reg.payment_status === filterStatus

        // Normalize both sides for comparison
        const normalizedAssignedAngel = (reg.assigned_angel || '').trim()
        const normalizedFilterAngel = filterAngel.trim()

        const matchesAngel = normalizedFilterAngel === 'Todos'
            ? true
            : normalizedFilterAngel === 'Sem Anjo'
                ? normalizedAssignedAngel === ''
                : normalizedAssignedAngel === normalizedFilterAngel

        return matchesSearch && matchesStatus && matchesAngel
    })

    const calculateAge = (birthDate: string) => {
        if (!birthDate) return 'N/A'
        const birth = new Date(birthDate)
        const today = new Date()
        let age = today.getFullYear() - birth.getFullYear()
        const m = today.getMonth() - birth.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--
        }
        return age
    }

    const getDetailedStats = () => {
        const kits: Record<string, number> = {}
        const tshirts: Record<string, number> = {}
        let totalTshirts = 0
        let totalRevenue = 0
        let maleCount = 0
        let femaleCount = 0
        let stayingOnSiteCount = 0

        registrations.forEach(reg => {
            if (reg.payment_status === 'Cancelado') return

            const kitName = reg.kit_option ? reg.kit_option.split(' - ')[0] : 'Sem Kit'
            kits[kitName] = (kits[kitName] || 0) + 1

            totalRevenue += reg.payment_amount || 0

            if (reg.tshirt_size) {
                tshirts[reg.tshirt_size] = (tshirts[reg.tshirt_size] || 0) + 1
                totalTshirts++
            }
            if (reg.tshirt_size_2) {
                tshirts[reg.tshirt_size_2] = (tshirts[reg.tshirt_size_2] || 0) + 1
                totalTshirts++
            }

            if (reg.gender === 'Masculino') maleCount++
            else if (reg.gender === 'Feminino') femaleCount++

            if (reg.staying_on_site) stayingOnSiteCount++
        })

        const sizeOrder = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'G1', 'G2', 'G3']
        const sortedTshirts = Object.entries(tshirts).sort((a: [string, number], b: [string, number]) => {
            const idxA = sizeOrder.indexOf(a[0])
            const idxB = sizeOrder.indexOf(b[0])
            if (idxA !== -1 && idxB !== -1) return idxA - idxB
            return a[0].localeCompare(b[0])
        })

        const activeRegistrations = registrations.filter(r => r.payment_status !== 'Cancelado').length

        const ageDist: Record<string, number> = {
            '12-13': 0,
            '14-16': 0,
            '17-20': 0,
            '> 20': 0
        }

        registrations.forEach(reg => {
            if (reg.payment_status === 'Cancelado') return
            const age = calculateAge(reg.birth_date)
            if (typeof age === 'number') {
                if (age >= 12 && age <= 13) ageDist['12-13']++
                else if (age >= 14 && age <= 16) ageDist['14-16']++
                else if (age >= 17 && age <= 20) ageDist['17-20']++
                else if (age > 20) ageDist['> 20']++
            }
        })

        return { kits, sortedTshirts, totalTshirts, totalRevenue, activeRegistrations, ageDist, maleCount, femaleCount, stayingOnSiteCount }
    }

    const stats = getDetailedStats()

    const exportToCSV = () => {
        const headers = ['Nome', 'Email', 'Telefone', 'Fone Emergência', 'Paróquia', 'Status Pagamento', 'Anjo', 'Camiseta', 'Camiseta 2', 'Kit', 'Cidade', 'Idade', 'Gênero', 'Endereço', 'Ficará no Local', 'Data Inscrição', 'Valor Pago']
        const rows = filtered.map(r => [
            r.full_name, r.email, r.phone, r.emergency_phone || '', r.parish, r.payment_status, r.assigned_angel || '', r.tshirt_size || 'N/A', r.tshirt_size_2 || 'N/A', r.kit_option, r.city, calculateAge(r.birth_date), r.gender || '', r.address || '', r.staying_on_site ? 'Sim' : 'Não', new Date(r.created_at).toLocaleDateString(), r.payment_amount || 0
        ])

        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n")
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", "inscritos_retiro_2026.csv")
        document.body.appendChild(link)
        link.click()
    }

    if (loading) return <div className="text-white flex items-center justify-center font-marker text-2xl h-screen animate-pulse">Carregando dados...</div>

    const pendingRegistrations = filtered.filter(r => r.payment_status === 'Pendente')
    const paidRegistrations = filtered.filter(r => r.payment_status === 'Pago')

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-8">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white italic">
                        Inscrições <span className="text-transparent bg-clip-text bg-gradient-to-r from-holi-primary to-blue-400">2026</span>
                    </h1>
                    <div className="flex items-center gap-4 mt-3 text-sm font-medium text-gray-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5">
                            <Users size={16} className="text-pink-500" />
                            {registrations.length} Cadastros
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                        <span className="flex items-center gap-1.5">
                            <CheckCircle size={16} className="text-emerald-400" />
                            {stats.activeRegistrations} Ativos
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 mr-2">
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            Lista
                        </button>
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'dashboard' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            Dashboard
                        </button>
                    </div>

                    <div className="relative group flex-1 xl:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-holi-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar nome, email, anjo..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full xl:w-64 bg-white/5 border border-transparent focus:border-holi-primary rounded-xl py-2.5 pl-10 pr-4 outline-none text-sm transition-all focus:bg-white/10"
                        />
                    </div>

                    <div className="relative group">
                        <select
                            value={filterAngel}
                            onChange={e => setFilterAngel(e.target.value)}
                            className="appearance-none bg-white/5 border border-transparent focus:border-holi-primary rounded-xl py-2.5 pl-4 pr-10 outline-none text-sm font-semibold transition-all cursor-pointer hover:bg-white/10 text-gray-300 min-w-[140px]"
                        >
                            <option value="Todos" className="bg-gray-900">Anjos: Todos</option>
                            <option value="Sem Anjo" className="bg-gray-900">Sem Anjo</option>
                            {uniqueAngels.map(angel => (
                                <option key={angel} value={angel} className="bg-gray-900">{angel}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-holi-primary transition-colors" size={16} />
                    </div>

                    <div className="relative group">
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="appearance-none bg-white/5 border border-transparent focus:border-holi-primary rounded-xl py-2.5 pl-4 pr-10 outline-none text-sm font-semibold transition-all cursor-pointer hover:bg-white/10 text-gray-300 min-w-[140px]"
                        >
                            <option value="Todos" className="bg-gray-900">Status: Todos</option>
                            <option value="Pendente" className="bg-gray-900">Pendentes</option>
                            <option value="Pago" className="bg-gray-900">Pagos</option>
                            <option value="Cancelado" className="bg-gray-900">Cancelados</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-holi-primary transition-colors" size={16} />
                    </div>

                    <button onClick={exportToCSV} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors" title="Exportar CSV">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'dashboard' ? (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-12"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white/[0.03] backdrop-blur-xl p-6 rounded-3xl border border-white/[0.08] border-l-4 border-l-holi-primary relative overflow-hidden group shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)]">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-holi-primary/10 rounded-full blur-2xl group-hover:bg-holi-primary/20 transition-all"></div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Valor Total</p>
                                <h3 className="text-3xl font-black text-white">R$ {stats.totalRevenue.toLocaleString('pt-BR')}</h3>
                                <div className="mt-4 flex items-center gap-1 text-emerald-400 text-xs font-bold">
                                    <Activity size={14} /> Em tempo real
                                </div>
                            </div>

                            <div className="bg-white/[0.03] backdrop-blur-xl p-6 rounded-3xl border border-white/[0.08] border-l-4 border-l-sky-400 relative overflow-hidden group shadow-[0_0_15px_-3px_rgba(56,189,248,0.3)]">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-sky-400/10 rounded-full blur-2xl group-hover:bg-sky-400/20 transition-all"></div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Ativos</p>
                                <h3 className="text-3xl font-black text-white">{stats.activeRegistrations}</h3>
                                <div className="mt-4 flex items-center gap-1 text-sky-400 text-xs font-bold">
                                    <Users size={14} /> Confirmados e Pendentes
                                </div>
                            </div>

                            <div className="bg-white/[0.03] backdrop-blur-xl p-6 rounded-3xl border border-white/[0.08] border-l-4 border-l-pink-500 relative overflow-hidden group shadow-[0_0_15px_-3px_rgba(236,72,153,0.3)]">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/20 transition-all"></div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Camisetas</p>
                                <h3 className="text-3xl font-black text-white">{stats.totalTshirts}</h3>
                                <div className="mt-4 flex items-center gap-1 text-pink-400 text-xs font-bold">
                                    <Shirt size={14} /> Total de peças
                                </div>
                            </div>

                            <div className="bg-white/[0.03] backdrop-blur-xl p-6 rounded-3xl border border-white/[0.08] border-l-4 border-l-amber-400 relative overflow-hidden group shadow-[0_0_15px_-3px_rgba(251,191,36,0.3)]">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/20 transition-all"></div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Kits Vendidos</p>
                                <h3 className="text-3xl font-black text-white">{Object.values(stats.kits).reduce((a, b) => a + b, 0)}</h3>
                                <div className="mt-4 flex items-center gap-1 text-amber-400 text-xs font-bold">
                                    <Package size={14} /> Kits selecionados
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 mb-2">
                                    <span className="w-1.5 h-6 bg-pink-500 rounded-full"></span> Production Grid
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {stats.sortedTshirts.map(([size, count]) => (
                                        <div key={size} className="bg-white/[0.03] backdrop-blur-xl p-4 rounded-2xl text-center group hover:bg-white/10 transition-colors border border-white/5">
                                            <span className="block text-2xl font-black text-pink-500 mb-1">{size}</span>
                                            <span className="text-xs font-bold text-gray-400">{count} UNID.</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 mb-2">
                                    <span className="w-1.5 h-6 bg-amber-400 rounded-full"></span> Kit Distribution
                                </h2>
                                <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 space-y-5 border border-white/5">
                                    {Object.entries(stats.kits).map(([kit, count]) => (
                                        <div key={kit}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-gray-300 uppercase">{kit}</span>
                                                <span className="text-xs font-black text-amber-400 italic">{Math.round((count / (registrations.length || 1)) * 100)}% ({count})</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" style={{ width: `${(count / (registrations.length || 1)) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 mb-4">
                                    <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span> Gênero & Alojamento
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                                        <span className="block text-3xl font-black text-blue-400">{stats.maleCount}</span>
                                        <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Meninos</span>
                                    </div>
                                    <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20 text-center">
                                        <span className="block text-3xl font-black text-pink-400">{stats.femaleCount}</span>
                                        <span className="text-[10px] font-bold text-pink-200 uppercase tracking-widest">Meninas</span>
                                    </div>
                                    <div className="col-span-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                                        <span className="block text-3xl font-black text-emerald-400">{stats.stayingOnSiteCount}</span>
                                        <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest">Dormirão no Local</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 mb-4">
                                    <span className="w-1.5 h-6 bg-sky-400 rounded-full"></span> Faixa Etária
                                </h2>
                                <div className="grid grid-cols-4 gap-2 h-[120px] items-end">
                                    {Object.entries(stats.ageDist).map(([range, count]) => {
                                        const maxCount = Math.max(...Object.values(stats.ageDist))
                                        const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0
                                        return (
                                            <div key={range} className="flex flex-col items-center gap-2">
                                                <span className="text-[10px] font-bold text-sky-400">{count}</span>
                                                <div className="w-full bg-sky-400/20 rounded-t-lg relative" style={{ height: `${percentage}%`, minHeight: '4px' }}>
                                                    <div className="absolute inset-0 bg-sky-400 rounded-t-lg opacity-50"></div>
                                                </div>
                                                <span className="text-[8px] font-bold text-gray-500 uppercase">{range}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    Pendentes ({pendingRegistrations.length})
                                </h3>
                                <div className="space-y-4">
                                    {pendingRegistrations.map(reg => (
                                        <div key={reg.id}
                                            onClick={() => setEditingReg(reg)}
                                            className="bg-white/[0.03] backdrop-blur-md rounded-2xl p-5 border-l-4 border-l-amber-500 hover:scale-[1.02] transition-transform cursor-pointer group shadow-lg border-y border-r border-white/5"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors line-clamp-1">{reg.full_name}</h4>
                                                    <p className="text-xs text-gray-500 font-mono lowercase">{reg.email}</p>
                                                </div>
                                                <span className="text-[10px] px-2 py-1 rounded bg-amber-500/10 text-amber-500 font-black uppercase tracking-wider border border-amber-500/20">PENDENTE</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-5 text-[11px]">
                                                <p className="text-gray-400 font-medium">Idade: {calculateAge(reg.birth_date)} anos</p>
                                                <p className="text-gray-400 font-medium truncate">Cidade: {reg.city}</p>
                                                <p className="text-sky-400 font-bold font-mono">WhatsApp: {reg.phone}</p>
                                                <p className="text-gray-400 font-medium truncate">Kit: {reg.kit_option.split(' - ')[0]}</p>
                                            </div>
                                            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                                <p className="text-[9px] uppercase font-bold text-gray-600 italic">{reg.assigned_angel ? `Anjo: ${reg.assigned_angel}` : 'SEM ANJO'}</p>
                                                <button onClick={(e) => handleDelete(reg.id, e)} className="text-gray-600 hover:text-red-400 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {pendingRegistrations.length === 0 && (
                                        <div className="p-10 text-center border border-dashed border-white/10 rounded-2xl text-gray-600 text-sm">
                                            Nenhuma inscrição pendente.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Pagos ({paidRegistrations.length})
                                </h3>
                                <div className="space-y-4">
                                    {paidRegistrations.map(reg => (
                                        <div key={reg.id}
                                            onClick={() => setEditingReg(reg)}
                                            className="bg-white/[0.03] backdrop-blur-md rounded-2xl p-5 border-l-4 border-l-emerald-500 hover:scale-[1.02] transition-transform cursor-pointer group shadow-lg border-y border-r border-white/5"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors line-clamp-1">{reg.full_name}</h4>
                                                    <p className="text-xs text-gray-500 font-mono lowercase">{reg.email}</p>
                                                </div>
                                                <span className="text-[10px] px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 font-black uppercase tracking-wider border border-emerald-500/20">PAGO</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-5 text-[11px]">
                                                <p className="text-gray-400 font-medium">Idade: {calculateAge(reg.birth_date)} anos</p>
                                                <p className="text-gray-400 font-medium truncate">Cidade: {reg.city}</p>
                                                <p className="text-sky-400 font-bold font-mono">WhatsApp: {reg.phone}</p>
                                                <p className="text-gray-400 font-medium truncate">Kit: {reg.kit_option.split(' - ')[0]}</p>
                                            </div>
                                            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                                <p className="text-[9px] uppercase font-bold text-gray-600 italic">{reg.assigned_angel ? `Anjo: ${reg.assigned_angel}` : 'SEM ANJO'}</p>
                                                <button onClick={(e) => handleDelete(reg.id, e)} className="text-gray-600 hover:text-red-400 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {paidRegistrations.length === 0 && (
                                        <div className="p-10 text-center border border-dashed border-white/10 rounded-2xl text-gray-600 text-sm">
                                            Nenhuma inscrição confirmada.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {editingReg && (
                    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl rounded-[2.5rem] p-8 md:p-10 relative shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-holi-primary via-holi-secondary to-holi-accent"></div>

                            <div className="flex justify-between items-start mb-8 shrink-0">
                                <div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">Detalhes</h2>
                                    <div className="flex gap-2 text-gray-500 font-mono text-xs">
                                        <span className="bg-white/5 px-2 py-1 rounded border border-white/5">ID: {editingReg.id.split('-')[0]}</span>
                                        <span className="bg-white/5 px-2 py-1 rounded border border-white/5">{new Date(editingReg.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <button onClick={() => setEditingReg(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleUpdateRegistration} className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest pl-1">Nome Completo</label>
                                        <input
                                            type="text"
                                            value={editingReg.full_name || ''}
                                            onChange={e => setEditingReg({ ...editingReg, full_name: e.target.value })}
                                            className="w-full bg-white/5 border-2 border-transparent focus:border-holi-primary/50 focus:bg-white/10 rounded-2xl py-4 px-5 outline-none text-white font-bold transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest pl-1">Email</label>
                                        <input
                                            type="email"
                                            value={editingReg.email || ''}
                                            onChange={e => setEditingReg({ ...editingReg, email: e.target.value })}
                                            className="w-full bg-white/5 border-2 border-transparent focus:border-holi-primary/50 focus:bg-white/10 rounded-2xl py-4 px-5 outline-none text-gray-300 font-medium transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest pl-1">Data Nascimento</label>
                                        <input
                                            type="date"
                                            value={editingReg.birth_date || ''}
                                            onChange={e => setEditingReg({ ...editingReg, birth_date: e.target.value })}
                                            className="w-full bg-white/5 border-2 border-transparent focus:border-holi-primary/50 focus:bg-white/10 rounded-2xl py-4 px-5 outline-none text-white font-mono transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest pl-1">Status Pagamento</label>
                                        <select
                                            value={editingReg.payment_status}
                                            onChange={e => setEditingReg({ ...editingReg, payment_status: e.target.value as any })}
                                            className={`w-full appearance-none rounded-2xl py-4 px-5 outline-none font-bold transition-all border-2 border-transparent
                                                ${editingReg.payment_status === 'Pago' ? 'bg-green-500/20 text-green-500' :
                                                    editingReg.payment_status === 'Pendente' ? 'bg-yellow-500/20 text-yellow-500' :
                                                        'bg-red-500/20 text-red-500'}
                                            `}
                                        >
                                            <option value="Pendente" className="bg-gray-900 text-white">Pendente</option>
                                            <option value="Pago" className="bg-gray-900 text-white">Pago</option>
                                            <option value="Cancelado" className="bg-gray-900 text-white">Cancelado</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest pl-1">Anjo (Padrinho)</label>
                                    <div className="relative">
                                        <UserCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <input
                                            type="text"
                                            value={editingReg.assigned_angel || ''}
                                            onChange={e => setEditingReg({ ...editingReg, assigned_angel: e.target.value })}
                                            className="w-full bg-white/5 border-2 border-transparent focus:border-holi-secondary/50 focus:bg-white/10 rounded-2xl py-4 pl-12 pr-5 outline-none text-holi-secondary font-bold transition-all"
                                            placeholder="Ainda não definido..."
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest pl-1">Telefone</label>
                                        <input
                                            type="text"
                                            value={editingReg.phone || ''}
                                            onChange={e => setEditingReg({ ...editingReg, phone: e.target.value })}
                                            className="w-full bg-white/5 border-2 border-transparent focus:border-white/20 rounded-2xl py-4 px-5 outline-none text-gray-300 font-mono text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-red-400/70 tracking-widest pl-1">Emergência</label>
                                        <input
                                            type="text"
                                            value={editingReg.emergency_phone || ''}
                                            onChange={e => setEditingReg({ ...editingReg, emergency_phone: e.target.value })}
                                            className="w-full bg-red-500/5 border-2 border-transparent focus:border-red-500/30 rounded-2xl py-4 px-5 outline-none text-red-300 font-mono text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest pl-1">Comprovante</label>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={editingReg.payment_receipt_url || ''}
                                                readOnly={true}
                                                className="flex-1 bg-white/5 border border-white/5 rounded-2xl py-4 px-5 outline-none text-xs font-mono text-gray-500 cursor-not-allowed"
                                                placeholder="Nenhum comprovante enviado"
                                            />
                                            {editingReg.payment_receipt_url && (
                                                <a href={editingReg.payment_receipt_url} target="_blank" rel="noopener noreferrer" className="px-6 bg-holi-primary text-white rounded-2xl flex items-center justify-center font-bold hover:scale-105 transition-all shadow-lg shadow-holi-primary/20">
                                                    Ver
                                                </a>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                onChange={handleAdminReceiptUpload}
                                                disabled={uploadingReceipt}
                                                className="hidden"
                                                id="admin-receipt-upload"
                                            />
                                            <label
                                                htmlFor="admin-receipt-upload"
                                                className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-white/20 hover:bg-white/5 cursor-pointer transition-all ${uploadingReceipt ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {uploadingReceipt ? (
                                                    <>
                                                        <Loader2 className="animate-spin text-white" size={16} />
                                                        <span className="text-xs font-bold text-gray-400">Enviando...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="text-gray-400" size={16} />
                                                        <span className="text-xs font-bold text-gray-400">
                                                            {editingReg.payment_receipt_url ? 'Substituir' : 'Enviar Comprovante'}
                                                        </span>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    disabled={isSaving}
                                    type="submit"
                                    className="w-full bg-white text-black font-black py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-xl text-lg mt-4"
                                >
                                    {isSaving ? 'Salvando...' : 'Salvar'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default RegistrationAdmin
