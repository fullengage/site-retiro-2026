import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Download, Users, CheckCircle,
    XCircle, Clock, Shirt, UserCheck,
    Filter, Edit3, X, Save, FileText, ExternalLink, Trash2, AlertTriangle, ChevronRight, BarChart3, Package, DollarSign, Activity, ShoppingBag, Mail, Table as TableIcon, Loader2, Upload, ChevronDown
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
    const [editingReg, setEditingReg] = useState<Registration | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [showDashboard, setShowDashboard] = useState(false)
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

    const uniqueAngels = Array.from(new Set(registrations.map(r => r.assigned_angel).filter(Boolean))).sort()

    const filtered = registrations.filter(reg => {
        const matchesSearch = reg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === 'Todos' || reg.payment_status === filterStatus
        const matchesAngel = filterAngel === 'Todos'
            ? true
            : filterAngel === 'Sem Anjo'
                ? !reg.assigned_angel
                : reg.assigned_angel === filterAngel

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
        })

        const sizeOrder = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG', 'EXG', 'G1', 'G2', 'G3']
        const sortedTshirts = Object.entries(tshirts).sort((a, b) => {
            const idxA = sizeOrder.indexOf(a[0])
            const idxB = sizeOrder.indexOf(b[0])
            if (idxA !== -1 && idxB !== -1) return idxA - idxB
            return a[0].localeCompare(b[0])
        })

        const activeRegistrations = registrations.filter(r => r.payment_status !== 'Cancelado').length

        // Age Distribution
        const ageDist: Record<string, number> = {
            '18-24': 0,
            '25-29': 0,
            '30-34': 0,
            '35-39': 0,
            '40+': 0
        }

        registrations.forEach(reg => {
            if (reg.payment_status === 'Cancelado') return
            const age = calculateAge(reg.birth_date)
            if (typeof age === 'number') {
                if (age < 25) ageDist['18-24']++
                else if (age < 30) ageDist['25-29']++
                else if (age < 35) ageDist['30-34']++
                else if (age < 40) ageDist['35-39']++
                else ageDist['40+']++
            }
        })

        return { kits, sortedTshirts, totalTshirts, totalRevenue, activeRegistrations, ageDist }
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
        link.setAttribute("download", "inscritos_retiro_2025.csv")
        document.body.appendChild(link)
        link.click()
    }

    if (loading) return <div className="text-white flex items-center justify-center font-marker text-2xl h-screen animate-pulse">Carregando dados...</div>

    const pendingRegistrations = filtered.filter(r => r.payment_status === 'Pendente')
    const paidRegistrations = filtered.filter(r => r.payment_status === 'Pago')
    // We can also include 'Cancelado' if needed, but the user asked to separate Paid vs Pending. We will display these two main groups.

    return (
        <div className="min-h-screen bg-[#050208] text-white p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-10">
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
                    <div className="relative group flex-1 xl:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-holi-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar nome, email, telefone..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full xl:w-80 bg-white/5 border border-transparent focus:border-holi-primary rounded-xl py-2.5 pl-10 pr-4 outline-none text-sm transition-all focus:bg-white/10"
                        />
                    </div>

                    <div className="relative group">
                        <select
                            value={filterAngel}
                            onChange={e => setFilterAngel(e.target.value)}
                            className="appearance-none bg-white/5 border border-transparent focus:border-holi-primary rounded-xl py-2.5 pl-4 pr-10 outline-none text-sm font-semibold transition-all cursor-pointer hover:bg-white/10 text-gray-300 min-w-[160px]"
                        >
                            <option value="Todos" className="bg-gray-900">Todos os Anjos</option>
                            <option value="Sem Anjo" className="bg-gray-900">Sem Anjo</option>
                            {uniqueAngels.map(angel => (
                                <option key={angel as string} value={angel as string} className="bg-gray-900">{angel as string}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-holi-primary transition-colors" size={16} />
                    </div>
                    <button onClick={() => setFilterStatus('Todos')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-semibold">
                        <Filter size={18} /> Todos
                    </button>
                    <button
                        onClick={() => setShowDashboard(!showDashboard)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all text-sm font-bold shadow-lg shadow-holi-primary/20 ${showDashboard ? 'bg-white text-black' : 'bg-holi-primary text-white hover:opacity-90'}`}
                    >
                        <BarChart3 size={18} /> DASHBOARD
                    </button>
                    <button onClick={exportToCSV} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* Dashboard Section (Collapsible) */}
            <AnimatePresence>
                {showDashboard && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-12"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {/* Card 1: Revenue - Purple Neon */}
                            <div className="bg-white/[0.03] backdrop-blur-xl p-6 rounded-3xl border border-white/[0.08] border-l-4 border-l-holi-primary relative overflow-hidden group shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)]">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-holi-primary/10 rounded-full blur-2xl group-hover:bg-holi-primary/20 transition-all"></div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Valor Total</p>
                                <h3 className="text-3xl font-black text-white">R$ {stats.totalRevenue.toLocaleString('pt-BR')}</h3>
                                <div className="mt-4 flex items-center gap-1 text-emerald-400 text-xs font-bold">
                                    <Activity size={14} /> +12% que ontem
                                </div>
                            </div>

                            {/* Card 2: Active Users - Blue Neon */}
                            <div className="bg-white/[0.03] backdrop-blur-xl p-6 rounded-3xl border border-white/[0.08] border-l-4 border-l-sky-400 relative overflow-hidden group shadow-[0_0_15px_-3px_rgba(56,189,248,0.3)]">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-sky-400/10 rounded-full blur-2xl group-hover:bg-sky-400/20 transition-all"></div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Ativos</p>
                                <h3 className="text-3xl font-black text-white">{stats.activeRegistrations}</h3>
                                <div className="mt-4 flex items-center gap-1 text-sky-400 text-xs font-bold">
                                    <Users size={14} /> 85% da meta
                                </div>
                            </div>

                            {/* Card 3: T-Shirts - Pink Neon */}
                            <div className="bg-white/[0.03] backdrop-blur-xl p-6 rounded-3xl border border-white/[0.08] border-l-4 border-l-pink-500 relative overflow-hidden group shadow-[0_0_15px_-3px_rgba(236,72,153,0.3)]">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/20 transition-all"></div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Camisetas</p>
                                <h3 className="text-3xl font-black text-white">{stats.totalTshirts}</h3>
                                <div className="mt-4 flex items-center gap-1 text-pink-400 text-xs font-bold">
                                    <Shirt size={14} /> Produção iniciada
                                </div>
                            </div>

                            {/* Card 4: Kits - Amber Neon */}
                            <div className="bg-white/[0.03] backdrop-blur-xl p-6 rounded-3xl border border-white/[0.08] border-l-4 border-l-amber-400 relative overflow-hidden group shadow-[0_0_15px_-3px_rgba(251,191,36,0.3)]">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/20 transition-all"></div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Kits Vendidos</p>
                                <h3 className="text-3xl font-black text-white">{Object.values(stats.kits).reduce((a, b) => a + b, 0)}</h3>
                                <div className="mt-4 flex items-center gap-1 text-amber-400 text-xs font-bold">
                                    <Package size={14} /> 15 em estoque
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* T-Shirt Grid */}
                            <div className="flex-1 space-y-4">
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

                            {/* Kit Dist */}
                            <div className="flex-1 space-y-4">
                                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 mb-2">
                                    <span className="w-1.5 h-6 bg-amber-400 rounded-full"></span> Kit Distribution
                                </h2>
                                <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 space-y-5 border border-white/5">
                                    {Object.entries(stats.kits).map(([kit, count]) => (
                                        <div key={kit}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-gray-300 uppercase">{kit}</span>
                                                <span className="text-xs font-black text-amber-400 italic">{Math.round((count / registrations.length) * 100)}% ({count})</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" style={{ width: `${(count / registrations.length) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Age Distribution Row */}
                        <div className="mt-8">
                            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 mb-4">
                                <span className="w-1.5 h-6 bg-sky-400 rounded-full"></span> Faixa Etária
                            </h2>
                            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 border border-white/5">
                                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                                    {Object.entries(stats.ageDist).map(([range, count]) => {
                                        const maxCount = Math.max(...Object.values(stats.ageDist))
                                        const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0
                                        return (
                                            <div key={range} className="flex flex-col items-center justify-end h-40 group relative">
                                                <span className="text-sky-400 font-black text-xl mb-2 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2">{count}</span>
                                                <div className="w-full max-w-[60px] bg-gray-800/50 rounded-t-xl relative overflow-hidden flex items-end h-full">
                                                    <div
                                                        className="w-full bg-gradient-to-t from-sky-400 to-blue-500 rounded-t-xl transition-all duration-1000 ease-out group-hover:brightness-110"
                                                        style={{ height: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-bold text-gray-400 mt-3 uppercase tracking-wider">{range}</span>
                                                <span className="text-[10px] font-mono text-gray-600">anos</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Split Lists: Pending vs Paid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* PENDING COLUMN */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            Pendentes ({pendingRegistrations.length})
                        </h3>
                    </div>

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

                                <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-5">
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest text-gray-600 font-bold mb-0.5">Idade</p>
                                        <p className="text-xs font-medium text-gray-300">{calculateAge(reg.birth_date)} anos</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest text-gray-600 font-bold mb-0.5">Cidade</p>
                                        <p className="text-xs font-medium text-gray-300 truncate">{reg.city}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest text-gray-600 font-bold mb-0.5">Telefone</p>
                                        <p className="text-xs font-bold text-sky-400 font-mono">{reg.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest text-gray-600 font-bold mb-0.5">Kit</p>
                                        <p className="text-xs font-medium text-gray-300 truncate">{reg.kit_option.split(' - ')[0]}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                    <p className="text-[9px] uppercase font-bold text-gray-600 italic">{reg.assigned_angel ? `Anjo: ${reg.assigned_angel}` : 'SEM ANJO'}</p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={(e) => handleDelete(reg.id, e)}
                                            className="text-gray-600 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <button className="text-[10px] font-black tracking-widest uppercase flex items-center gap-1 group/btn hover:text-white text-gray-400 transition-colors">
                                            DETALHES <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
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

                {/* PAID COLUMN */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Pagos ({paidRegistrations.length})
                        </h3>
                    </div>

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

                                <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-5">
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest text-gray-600 font-bold mb-0.5">Idade</p>
                                        <p className="text-xs font-medium text-gray-300">{calculateAge(reg.birth_date)} anos</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest text-gray-600 font-bold mb-0.5">Cidade</p>
                                        <p className="text-xs font-medium text-gray-300 truncate">{reg.city}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest text-gray-600 font-bold mb-0.5">Telefone</p>
                                        <p className="text-xs font-bold text-sky-400 font-mono">{reg.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest text-gray-600 font-bold mb-0.5">Kit</p>
                                        <p className="text-xs font-medium text-gray-300 truncate">{reg.kit_option.split(' - ')[0]}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                    <p className="text-[9px] uppercase font-bold text-gray-600 italic">{reg.assigned_angel ? `Anjo: ${reg.assigned_angel}` : 'SEM ANJO'}</p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={(e) => handleDelete(reg.id, e)}
                                            className="text-gray-600 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <button className="text-[10px] font-black tracking-widest uppercase flex items-center gap-1 group/btn hover:text-white text-gray-400 transition-colors">
                                            DETALHES <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
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


            {/* Edit Modal (Keeping existing logic but updating z-index as requested previously) */}
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
                                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest pl-1">Data Nascimento (Idade: {calculateAge(editingReg.birth_date)})</label>
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
                                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest pl-1">Telefone / WhatsApp</label>
                                        <input
                                            type="text"
                                            value={editingReg.phone || ''}
                                            onChange={e => setEditingReg({ ...editingReg, phone: e.target.value })}
                                            className="w-full bg-white/5 border-2 border-transparent focus:border-white/20 rounded-2xl py-4 px-5 outline-none text-gray-300 font-mono text-sm transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-red-400/70 tracking-widest pl-1">Emergência</label>
                                        <input
                                            type="text"
                                            value={editingReg.emergency_phone || ''}
                                            onChange={e => setEditingReg({ ...editingReg, emergency_phone: e.target.value })}
                                            className="w-full bg-red-500/5 border-2 border-transparent focus:border-red-500/30 rounded-2xl py-4 px-5 outline-none text-red-300 font-mono text-sm transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest pl-1">Endereço</label>
                                        <input
                                            type="text"
                                            value={editingReg.address || ''}
                                            onChange={e => setEditingReg({ ...editingReg, address: e.target.value })}
                                            className="w-full bg-white/5 border-2 border-transparent focus:border-white/20 rounded-2xl py-4 px-5 outline-none text-gray-300 text-sm transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest pl-1">Cidade</label>
                                        <input
                                            type="text"
                                            value={editingReg.city || ''}
                                            onChange={e => setEditingReg({ ...editingReg, city: e.target.value })}
                                            className="w-full bg-white/5 border-2 border-transparent focus:border-white/20 rounded-2xl py-4 px-5 outline-none text-gray-300 text-sm transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest pl-1">Paróquia</label>
                                        <select
                                            value={editingReg.parish || ''}
                                            onChange={e => setEditingReg({ ...editingReg, parish: e.target.value })}
                                            className="w-full bg-white/5 border-2 border-transparent focus:border-white/20 rounded-2xl py-4 px-5 outline-none text-gray-300 text-sm transition-all appearance-none"
                                        >
                                            <option value="" disabled className="bg-gray-900">Selecione...</option>
                                            <option value="Paróquia São José da Santíssima Trindade" className="bg-gray-900">Paróquia São José da Santíssima Trindade</option>
                                            <option value="Paróquia Santa Clara de Assis" className="bg-gray-900">Paróquia Santa Clara de Assis</option>
                                            <option value="Paróquia São Sebastião" className="bg-gray-900">Paróquia São Sebastião</option>
                                            <option value="Outros" className="bg-gray-900">Outros</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest pl-1">Sexo</label>
                                        <select
                                            value={editingReg.gender || ''}
                                            onChange={e => setEditingReg({ ...editingReg, gender: e.target.value })}
                                            className="w-full bg-white/5 border-2 border-transparent focus:border-white/20 rounded-2xl py-4 px-5 outline-none text-gray-300 text-sm transition-all appearance-none"
                                        >
                                            <option value="" disabled className="bg-gray-900">Selecione...</option>
                                            <option value="Masculino" className="bg-gray-900">Masculino</option>
                                            <option value="Feminino" className="bg-gray-900">Feminino</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col sm:flex-row gap-4 sm:items-center">
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest pl-1 block mb-2">Opção de Kit</label>
                                        <select
                                            value={editingReg.kit_option || ''}
                                            onChange={e => setEditingReg({ ...editingReg, kit_option: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl py-2 px-3 outline-none text-white text-sm transition-all"
                                        >
                                            <option value="Kit 01 - Inscrição (R$ 50,00)" className="bg-gray-900">Kit 01 (R$ 50)</option>
                                            <option value="Kit 02 - Inscrição + Camiseta (R$ 100,00)" className="bg-gray-900">Kit 02 (R$ 100)</option>
                                            <option value="Kit 03 - Inscrição + 2 Camisetas + Kit Radical (R$ 200,00)" className="bg-gray-900">Kit 03 (R$ 200)</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-3 pt-4 sm:pt-0">
                                        <input
                                            type="checkbox"
                                            checked={editingReg.staying_on_site || false}
                                            onChange={e => setEditingReg({ ...editingReg, staying_on_site: e.target.checked })}
                                            className="w-5 h-5 accent-holi-primary"
                                            id="staying_check"
                                        />
                                        <label htmlFor="staying_check" className="text-sm font-bold text-white cursor-pointer select-none">
                                            Dormir no local?
                                        </label>
                                    </div>
                                </div>

                                <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><Shirt size={14} /> Preferências do Kit</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase text-gray-600">Camiseta 1</label>
                                            <input
                                                type="text"
                                                value={editingReg.tshirt_size || ''}
                                                onChange={e => setEditingReg({ ...editingReg, tshirt_size: e.target.value })}
                                                className="w-full bg-black border border-white/10 p-3 rounded-xl text-sm outline-none focus:border-holi-primary"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase text-gray-600">Camiseta 2</label>
                                            <input
                                                type="text"
                                                value={editingReg.tshirt_size_2 || ''}
                                                onChange={e => setEditingReg({ ...editingReg, tshirt_size_2: e.target.value })}
                                                className="w-full bg-black border border-white/10 p-3 rounded-xl text-sm outline-none focus:border-holi-primary"
                                            />
                                        </div>
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
                                                    Visualizar
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
                                                            {editingReg.payment_receipt_url ? 'Substituir Comprovante' : 'Enviar Comprovante (Admin)'}
                                                        </span>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    disabled={isSaving}
                                    className="w-full bg-white text-black font-black py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-xl text-lg mt-4"
                                >
                                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    )
}

export default RegistrationAdmin
