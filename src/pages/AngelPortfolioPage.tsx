import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users, Phone, Mail, CheckCircle, Clock, XCircle,
    ChevronDown, ChevronUp, DollarSign, Package, Shirt, TrendingUp
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
    gender: string | null
}

interface AngelPortfolio {
    name: string
    registrations: Registration[]
    totalRevenue: number
    paidCount: number
    pendingCount: number
    canceledCount: number
}

const AngelPortfolioPage = () => {
    const { userRole } = useOutletContext<{ userRole: 'admin' | 'redator' }>()
    const [registrations, setRegistrations] = useState<Registration[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedAngel, setExpandedAngel] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

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

    // Group registrations by angel
    const angelPortfolios: AngelPortfolio[] = React.useMemo(() => {
        const grouped = new Map<string, Registration[]>()

        registrations.forEach(reg => {
            const angelName = (reg.assigned_angel || '').trim() || 'Sem Anjo'
            if (!grouped.has(angelName)) {
                grouped.set(angelName, [])
            }
            grouped.get(angelName)!.push(reg)
        })

        const portfolios: AngelPortfolio[] = []
        grouped.forEach((regs, name) => {
            const paidCount = regs.filter(r => r.payment_status === 'Pago').length
            const pendingCount = regs.filter(r => r.payment_status === 'Pendente').length
            const canceledCount = regs.filter(r => r.payment_status === 'Cancelado').length
            const totalRevenue = regs
                .filter(r => r.payment_status !== 'Cancelado')
                .reduce((sum, r) => sum + (r.payment_amount || 0), 0)

            portfolios.push({
                name,
                registrations: regs,
                totalRevenue,
                paidCount,
                pendingCount,
                canceledCount
            })
        })

        // Sort: "Sem Anjo" last, others alphabetically
        return portfolios.sort((a, b) => {
            if (a.name === 'Sem Anjo') return 1
            if (b.name === 'Sem Anjo') return -1
            return a.name.localeCompare(b.name)
        })
    }, [registrations])

    const filteredPortfolios = angelPortfolios.filter(portfolio => {
        const lowerSearch = searchTerm.toLowerCase().trim()
        if (!lowerSearch) return true

        // Search in angel name or any registration in their portfolio
        return portfolio.name.toLowerCase().includes(lowerSearch) ||
            portfolio.registrations.some(reg =>
                reg.full_name.toLowerCase().includes(lowerSearch) ||
                reg.email.toLowerCase().includes(lowerSearch) ||
                (reg.phone || '').includes(lowerSearch)
            )
    })

    const totalStats = React.useMemo(() => {
        const activeRegs = registrations.filter(r => r.payment_status !== 'Cancelado')
        return {
            totalAngels: angelPortfolios.filter(p => p.name !== 'Sem Anjo').length,
            totalRegistrations: activeRegs.length,
            totalRevenue: activeRegs.reduce((sum, r) => sum + (r.payment_amount || 0), 0),
            unassigned: angelPortfolios.find(p => p.name === 'Sem Anjo')?.registrations.filter(r => r.payment_status !== 'Cancelado').length || 0
        }
    }, [angelPortfolios, registrations])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-white text-2xl font-marker animate-pulse">Carregando carteiras...</div>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white italic mb-3">
                    Carteira de <span className="text-transparent bg-clip-text bg-gradient-to-r from-holi-secondary to-holi-accent">Anjos</span>
                </h1>
                <p className="text-gray-400 text-sm">Gestão de inscritos por padrinho/madrinha</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/[0.03] backdrop-blur-xl p-5 rounded-2xl border border-white/[0.08] border-l-4 border-l-holi-secondary">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total de Anjos</p>
                    <h3 className="text-3xl font-black text-white">{totalStats.totalAngels}</h3>
                </div>
                <div className="bg-white/[0.03] backdrop-blur-xl p-5 rounded-2xl border border-white/[0.08] border-l-4 border-l-sky-400">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Inscritos Ativos</p>
                    <h3 className="text-3xl font-black text-white">{totalStats.totalRegistrations}</h3>
                </div>
                <div className="bg-white/[0.03] backdrop-blur-xl p-5 rounded-2xl border border-white/[0.08] border-l-4 border-l-emerald-400">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Receita Total</p>
                    <h3 className="text-3xl font-black text-white">R$ {totalStats.totalRevenue.toLocaleString('pt-BR')}</h3>
                </div>
                <div className="bg-white/[0.03] backdrop-blur-xl p-5 rounded-2xl border border-white/[0.08] border-l-4 border-l-amber-400">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Sem Anjo</p>
                    <h3 className="text-3xl font-black text-white">{totalStats.unassigned}</h3>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Buscar anjo ou inscrito..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full md:w-96 bg-white/5 border border-white/10 focus:border-holi-secondary rounded-xl py-3 px-4 outline-none text-sm transition-all"
                />
            </div>

            {/* Angel Portfolios */}
            <div className="space-y-4">
                {filteredPortfolios.map(portfolio => {
                    const isExpanded = expandedAngel === portfolio.name
                    const activeRegs = portfolio.registrations.filter(r => r.payment_status !== 'Cancelado')

                    return (
                        <motion.div
                            key={portfolio.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.08] overflow-hidden"
                        >
                            {/* Angel Header */}
                            <button
                                onClick={() => setExpandedAngel(isExpanded ? null : portfolio.name)}
                                className="w-full p-6 flex items-center justify-between hover:bg-white/[0.05] transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${portfolio.name === 'Sem Anjo'
                                            ? 'bg-gray-500/20 text-gray-400'
                                            : 'bg-holi-secondary/20 text-holi-secondary'
                                        }`}>
                                        {portfolio.name === 'Sem Anjo' ? '?' : portfolio.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-xl font-black text-white">{portfolio.name}</h3>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {activeRegs.length} {activeRegs.length === 1 ? 'inscrito' : 'inscritos'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="hidden md:flex items-center gap-6 text-sm">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={16} className="text-emerald-400" />
                                            <span className="font-bold text-emerald-400">{portfolio.paidCount}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-amber-400" />
                                            <span className="font-bold text-amber-400">{portfolio.pendingCount}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={16} className="text-gray-400" />
                                            <span className="font-bold text-white">R$ {portfolio.totalRevenue.toLocaleString('pt-BR')}</span>
                                        </div>
                                    </div>
                                    {isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                                </div>
                            </button>

                            {/* Expanded Content */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="border-t border-white/[0.08]"
                                    >
                                        <div className="p-6 space-y-3">
                                            {portfolio.registrations.map(reg => (
                                                <div
                                                    key={reg.id}
                                                    className={`p-4 rounded-xl border-l-4 ${reg.payment_status === 'Pago'
                                                            ? 'bg-emerald-500/5 border-l-emerald-500'
                                                            : reg.payment_status === 'Pendente'
                                                                ? 'bg-amber-500/5 border-l-amber-500'
                                                                : 'bg-red-500/5 border-l-red-500'
                                                        }`}
                                                >
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h4 className="font-bold text-white">{reg.full_name}</h4>
                                                                <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${reg.payment_status === 'Pago'
                                                                        ? 'bg-emerald-500/20 text-emerald-400'
                                                                        : reg.payment_status === 'Pendente'
                                                                            ? 'bg-amber-500/20 text-amber-400'
                                                                            : 'bg-red-500/20 text-red-400'
                                                                    }`}>
                                                                    {reg.payment_status}
                                                                </span>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-400">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Phone size={12} />
                                                                    <span>{reg.phone}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <Mail size={12} />
                                                                    <span className="truncate">{reg.email}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <Users size={12} />
                                                                    <span>{calculateAge(reg.birth_date)} anos • {reg.gender || 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs">
                                                            <div className="flex items-center gap-1.5 text-gray-400">
                                                                <Package size={12} />
                                                                <span>{reg.kit_option.split(' - ')[0]}</span>
                                                            </div>
                                                            {reg.tshirt_size && (
                                                                <div className="flex items-center gap-1.5 text-gray-400">
                                                                    <Shirt size={12} />
                                                                    <span>{reg.tshirt_size}</span>
                                                                </div>
                                                            )}
                                                            <div className="font-bold text-white">
                                                                R$ {(reg.payment_amount || 0).toLocaleString('pt-BR')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )
                })}
            </div>

            {filteredPortfolios.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-gray-500 text-lg">Nenhum anjo encontrado</p>
                </div>
            )}
        </div>
    )
}

export default AngelPortfolioPage
