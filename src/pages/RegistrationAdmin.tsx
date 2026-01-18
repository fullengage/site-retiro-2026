import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Download, Users, CheckCircle,
    XCircle, Clock, Shirt, UserCheck,
    Filter, Edit3, X, Save, LogIn, Sun, FileText, ExternalLink
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
    const [registrations, setRegistrations] = useState<Registration[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('Todos')
    const [editingReg, setEditingReg] = useState<Registration | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    // Auth States
    const [user, setUser] = useState<any>(null)
    const [userRole, setUserRole] = useState<'admin' | 'redator' | null>(null)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [authLoading, setAuthLoading] = useState(true)
    const [authError, setAuthError] = useState<string | null>(null)

    useEffect(() => {
        checkUser()
    }, [])

    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
            setUser(session.user)
            await checkRole(session.user.email!, session.user.id)
            fetchRegistrations()
        }
        setAuthLoading(false)
    }

    const checkRole = async (userEmail: string, userId: string) => {
        // Reuse the logic from NewsAdmin
        const { data: editor } = await supabase.from('news_editors').select('role').ilike('email', userEmail).single()
        if (editor) {
            setUserRole(editor.role as any)
            return
        }
        const { data: globalRole } = await supabase.from('user_roles').select('role').eq('user_id', userId).single()
        if (globalRole && (globalRole.role === 'admin' || globalRole.role === 'gestor')) {
            setUserRole('admin')
            return
        }
        if (userEmail === 'richard.fullweb@gmail.com') {
            setUserRole('admin')
            return
        }
        setUserRole(null)
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setAuthLoading(true)
        setAuthError(null)
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            setAuthError(error.message)
            setAuthLoading(false)
        } else {
            setUser(data.user)
            await checkRole(data.user.email!, data.user.id)
            fetchRegistrations()
            setAuthLoading(false)
        }
    }

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
                phone: editingReg.phone,
                emergency_phone: editingReg.emergency_phone,
                address: editingReg.address,
                city: editingReg.city,
                parish: editingReg.parish,
                tshirt_size: editingReg.tshirt_size,
                tshirt_size_2: editingReg.tshirt_size_2,
                staying_on_site: editingReg.staying_on_site,
                gender: editingReg.gender
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

    const filtered = registrations.filter(reg => {
        const matchesSearch = reg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === 'Todos' || reg.payment_status === filterStatus
        return matchesSearch && matchesStatus
    })

    const stats = {
        total: registrations.length,
        paid: registrations.filter(r => r.payment_status === 'Pago').length,
        pending: registrations.filter(r => r.payment_status === 'Pendente').length,
        tshirts: registrations.filter(r => r.tshirt_size).length
    }

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

    const exportToCSV = () => {
        const headers = ['Nome', 'Email', 'Telefone', 'Fone Emergência', 'Paróquia', 'Status Pagamento', 'Anjo', 'Camiseta', 'Camiseta 2', 'Kit', 'Cidade', 'Idade', 'Gênero', 'Endereço', 'Ficará no Local', 'Data Inscrição']
        const rows = filtered.map(r => [
            r.full_name, r.email, r.phone, r.emergency_phone || '', r.parish, r.payment_status, r.assigned_angel || '', r.tshirt_size || 'N/A', r.tshirt_size_2 || 'N/A', r.kit_option, r.city, calculateAge(r.birth_date), r.gender || '', r.address || '', r.staying_on_site ? 'Sim' : 'Não', new Date(r.created_at).toLocaleDateString()
        ])

        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n")
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", "inscritos_retiro_2025.csv")
        document.body.appendChild(link)
        link.click()
    }

    if (authLoading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-black uppercase tracking-widest text-2xl">Carregando...</div>

    if (!user || (!userRole && !authLoading)) {
        return (
            <div className="min-h-screen bg-[#050208] text-white flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md relative z-10 text-center"
                >
                    <div className="inline-block p-4 bg-white/5 border border-white/10 rounded-3xl mb-8">
                        <Sun className="text-holi-primary animate-spin-slow" size={48} />
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter mb-8">Admin Inscrições</h1>

                    <form onSubmit={handleLogin} className="space-y-4 bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl text-left">
                        {authError && <div className="p-4 bg-red-500/20 text-red-500 rounded-xl text-xs font-bold uppercase mb-4 border border-red-500">{authError}</div>}

                        <div>
                            <label className="text-[10px] font-bold uppercase text-gray-500 mb-2 block tracking-widest">E-mail</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:border-holi-primary outline-none" required />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-gray-500 mb-2 block tracking-widest">Senha</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:border-holi-primary outline-none" required />
                        </div>
                        <button type="submit" className="w-full bg-holi-primary text-white font-black py-5 rounded-2xl hover:bg-holi-primary/80 transition-all flex items-center justify-center gap-2 mt-6 uppercase">
                            <LogIn size={20} /> Acessar
                        </button>
                    </form>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050208] text-white pt-24 pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Inscrições <span className="text-holi-primary">2025</span></h1>
                        <p className="text-gray-500 font-mono text-xs mt-2 uppercase tracking-widest">Gerenciamento de participantes do retiro</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={exportToCSV} className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2 font-bold text-sm uppercase">
                            <Download size={18} /> Exportar CSV
                        </button>
                        <button onClick={() => window.location.href = '/admin'} className="bg-holi-surface border border-white/10 px-6 py-4 rounded-2xl hover:bg-white/10 transition-all font-bold text-sm uppercase">
                            Voltar ao Admin Geral
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {[
                        { label: 'Total Inscritos', value: stats.total, icon: <Users />, color: 'text-white' },
                        { label: 'Pagamentos Ok', value: stats.paid, icon: <CheckCircle />, color: 'text-green-500' },
                        { label: 'Pendentes', value: stats.pending, icon: <Clock />, color: 'text-yellow-500' },
                        { label: 'Camisetas', value: stats.tshirts, icon: <Shirt />, color: 'text-holi-primary' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-holi-surface border border-white/10 p-6 rounded-3xl">
                            <div className={`${stat.color} mb-2`}>{stat.icon}</div>
                            <div className="text-3xl font-black">{stat.value}</div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-holi-surface border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-holi-primary outline-none"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <select
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                                className="bg-holi-surface border border-white/10 rounded-2xl py-4 pl-12 pr-10 outline-none appearance-none font-bold text-sm"
                            >
                                <option>Todos</option>
                                <option>Pendente</option>
                                <option>Pago</option>
                                <option>Cancelado</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-holi-surface border border-white/10 rounded-[2.5rem] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">Participante</th>
                                    <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">Paróquia / Cidade</th>
                                    <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">Camiseta / Kit</th>
                                    <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">Status Pagamento</th>
                                    <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">Comprovante</th>
                                    <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">Anjo Responsável</th>
                                    <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr><td colSpan={7} className="p-12 text-center text-gray-500 font-mono">Carregando dados...</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={7} className="p-12 text-center text-gray-500 font-mono">Nenhuma inscrição encontrada.</td></tr>
                                ) : (
                                    filtered.map(reg => (
                                        <tr key={reg.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-6">
                                                <button
                                                    onClick={() => setEditingReg(reg)}
                                                    className="text-left hover:text-holi-primary transition-colors group/name"
                                                >
                                                    <div className="font-bold text-white group-hover/name:text-holi-primary">{reg.full_name}</div>
                                                    <div className="text-xs text-gray-500">{reg.email}</div>
                                                </button>
                                                <div className="flex gap-2 items-center mt-1">
                                                    <div className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-400 font-bold uppercase tracking-widest">{calculateAge(reg.birth_date)} anos</div>
                                                    <div className="text-xs text-holi-secondary">{reg.phone}</div>
                                                </div>
                                                {reg.emergency_phone && (
                                                    <div className="text-[10px] text-red-400/80 mt-1 uppercase font-bold tracking-tighter">🚨 Pais: {reg.emergency_phone}</div>
                                                )}
                                            </td>
                                            <td className="p-6">
                                                <div className="text-sm font-bold text-gray-300">{reg.parish}</div>
                                                <div className="text-xs text-gray-500 uppercase">{reg.city}</div>
                                            </td>
                                            <td className="p-6">
                                                {reg.tshirt_size ? (
                                                    <div className="flex items-center gap-2 bg-holi-primary/10 text-holi-primary px-3 py-1 rounded-full text-[10px] font-black w-fit mb-1 border border-holi-primary/20">
                                                        <Shirt size={12} /> {reg.tshirt_size}
                                                    </div>
                                                ) : <div className="text-xs text-gray-600">—</div>}
                                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter truncate max-w-[120px]">{reg.kit_option}</div>
                                            </td>
                                            <td className="p-6">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${reg.payment_status === 'Pago' ? 'border-green-500/30 bg-green-500/10 text-green-500' :
                                                    reg.payment_status === 'Pendente' ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-500' :
                                                        'border-red-500/30 bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {reg.payment_status === 'Pago' ? <CheckCircle size={10} /> :
                                                        reg.payment_status === 'Pendente' ? <Clock size={10} /> : <XCircle size={10} />}
                                                    {reg.payment_status}
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                {reg.payment_receipt_url ? (
                                                    <a
                                                        href={reg.payment_receipt_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 px-3 py-2 bg-holi-primary/10 text-holi-primary border border-holi-primary/20 rounded-xl hover:bg-holi-primary hover:text-white transition-all text-xs font-bold"
                                                    >
                                                        <FileText size={14} />
                                                        Ver Comprovante
                                                        <ExternalLink size={12} />
                                                    </a>
                                                ) : (
                                                    <div className="text-xs text-gray-600 italic">Sem comprovante</div>
                                                )}
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <UserCheck size={16} className={reg.assigned_angel ? 'text-holi-primary' : 'text-gray-700'} />
                                                    <span className={reg.assigned_angel ? 'font-bold' : 'italic text-gray-600'}>
                                                        {reg.assigned_angel || 'Não atribuído'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <button
                                                    onClick={() => setEditingReg(reg)}
                                                    className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-holi-primary hover:text-white transition-all"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingReg && (
                    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-holi-surface border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 md:p-12 relative"
                        >
                            <button onClick={() => setEditingReg(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={24} /></button>

                            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Editar Participante</h2>
                            <p className="text-gray-500 text-sm mb-8">{editingReg.full_name}</p>

                            <form onSubmit={handleUpdateRegistration} className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500 mb-2 block tracking-widest">Nome Completo</label>
                                        <input
                                            type="text"
                                            value={editingReg.full_name || ''}
                                            onChange={e => setEditingReg({ ...editingReg, full_name: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-6 focus:border-holi-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500 mb-2 block tracking-widest">Gênero</label>
                                        <select
                                            value={editingReg.gender || ''}
                                            onChange={e => setEditingReg({ ...editingReg, gender: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-6 focus:border-holi-primary outline-none appearance-none"
                                        >
                                            <option value="">Selecione</option>
                                            <option value="Masculino">Masculino</option>
                                            <option value="Feminino">Feminino</option>
                                            <option value="Outro">Outro</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500 mb-2 block tracking-widest">Telefone</label>
                                        <input
                                            type="text"
                                            value={editingReg.phone || ''}
                                            onChange={e => setEditingReg({ ...editingReg, phone: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-6 focus:border-holi-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500 mb-2 block tracking-widest">Telefone Pais/Emergência</label>
                                        <input
                                            type="text"
                                            value={editingReg.emergency_phone || ''}
                                            onChange={e => setEditingReg({ ...editingReg, emergency_phone: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-6 focus:border-holi-primary outline-none text-red-400 font-bold"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-500 mb-2 block tracking-widest">Endereço Completo</label>
                                    <textarea
                                        value={editingReg.address || ''}
                                        onChange={e => setEditingReg({ ...editingReg, address: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-6 focus:border-holi-primary outline-none h-24 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500 mb-2 block tracking-widest">Paróquia</label>
                                        <input
                                            type="text"
                                            value={editingReg.parish || ''}
                                            onChange={e => setEditingReg({ ...editingReg, parish: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-6 focus:border-holi-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500 mb-2 block tracking-widest">Cidade</label>
                                        <input
                                            type="text"
                                            value={editingReg.city || ''}
                                            onChange={e => setEditingReg({ ...editingReg, city: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-6 focus:border-holi-primary outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500 mb-2 block tracking-widest">Tamanho Camiseta 1</label>
                                        <input
                                            type="text"
                                            value={editingReg.tshirt_size || ''}
                                            onChange={e => setEditingReg({ ...editingReg, tshirt_size: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-6 focus:border-holi-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500 mb-2 block tracking-widest">Tamanho Camiseta 2</label>
                                        <input
                                            type="text"
                                            value={editingReg.tshirt_size_2 || ''}
                                            onChange={e => setEditingReg({ ...editingReg, tshirt_size_2: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-6 focus:border-holi-primary outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                                    <input
                                        type="checkbox"
                                        id="staying_on_site"
                                        checked={editingReg.staying_on_site || false}
                                        onChange={e => setEditingReg({ ...editingReg, staying_on_site: e.target.checked })}
                                        className="w-5 h-5 accent-holi-primary"
                                    />
                                    <label htmlFor="staying_on_site" className="text-sm font-bold uppercase tracking-tight">Vai dormir no local do retiro?</label>
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-500 mb-2 block tracking-widest">URL do Comprovante</label>
                                    <input
                                        type="text"
                                        value={editingReg.payment_receipt_url || ''}
                                        onChange={e => setEditingReg({ ...editingReg, payment_receipt_url: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-6 focus:border-holi-primary outline-none text-xs font-mono"
                                        placeholder="https://..."
                                    />
                                    {editingReg.payment_receipt_url && (
                                        <a href={editingReg.payment_receipt_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-holi-primary hover:underline mt-2 inline-flex items-center gap-1">
                                            <ExternalLink size={10} /> Testar link do comprovante
                                        </a>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-500 mb-2 block tracking-widest">Status Pagamento</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Pendente', 'Pago', 'Cancelado'].map(status => (
                                            <label key={status}>
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value={status}
                                                    checked={editingReg.payment_status === status}
                                                    onChange={() => setEditingReg({ ...editingReg, payment_status: status as any })}
                                                    className="hidden peer"
                                                />
                                                <div className="bg-black/50 border border-white/10 rounded-xl py-3 text-center cursor-pointer hover:border-white/20 peer-checked:bg-white peer-checked:text-black text-[10px] font-black transition-all uppercase">
                                                    {status}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-500 mb-2 block tracking-widest">Anjo Responsável</label>
                                    <input
                                        type="text"
                                        value={editingReg.assigned_angel || ''}
                                        onChange={e => setEditingReg({ ...editingReg, assigned_angel: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-6 focus:border-holi-primary outline-none"
                                        placeholder="Nome do anjo..."
                                    />
                                </div>

                                <button
                                    disabled={isSaving}
                                    className="w-full bg-holi-primary text-white font-black py-5 rounded-2xl hover:bg-holi-primary/80 transition-all flex items-center justify-center gap-2 mt-8 uppercase tracking-widest sticky bottom-0"
                                >
                                    {isSaving ? 'Salvando...' : <><Save size={20} /> Salvar Alterações</>}
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
