import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Shirt, Search, Download, CheckCircle, AlertCircle,
    Plus, Filter, Printer, Users, Heart, ShoppingBag,
    Sparkles, RefreshCw, ChevronDown, Check, X, FileText
} from 'lucide-react'

export interface TshirtOrderItem {
    id: string
    name: string
    category: 'Participante' | 'Anjo' | 'Avulso'
    size: 'PP' | 'P' | 'M' | 'G' | 'GG' | 'G1' | 'G2' | 'EXG'
    status: 'Pago' | 'Pendente'
    amount?: number
    phone?: string
    notes?: string
    receiptUrl?: string
}

const INITIAL_TSHIRT_ORDERS: TshirtOrderItem[] = [
    // --- PARTICIPANTES PAGOS (23) ---
    { id: 'part-1', name: 'Amanda dadda Rodrigues', category: 'Participante', size: 'P', status: 'Pago', amount: 50, phone: '(17) 99755-7925', notes: 'Pré-Convite' },
    { id: 'part-2', name: 'Elisa Rosani Top', category: 'Participante', size: 'P', status: 'Pago', amount: 50, phone: '(17) 99650-7550', notes: 'Pré-Convite' },
    { id: 'part-3', name: 'Heitor Pedroso L. Gradella Sperandio', category: 'Participante', size: 'P', status: 'Pago', amount: 50, phone: '(17) 99111-0214', notes: 'Pré-Convite' },
    { id: 'part-4', name: 'Helena Fermino da Silva', category: 'Participante', size: 'M', status: 'Pago', amount: 50, phone: '(16) 99747-1543', notes: 'Pré-Convite' },
    { id: 'part-5', name: 'Heloísa Men Pereira', category: 'Participante', size: 'P', status: 'Pago', amount: 50, phone: '(17) 99766-6337', notes: 'Pré-Convite' },
    { id: 'part-6', name: 'Heloísa Oliveira Balero', category: 'Participante', size: 'G', status: 'Pago', amount: 50, phone: '(17) 99127-2008', notes: 'Pré-Convite' },
    { id: 'part-7', name: 'Higor Acácio Marques Paulino', category: 'Participante', size: 'M', status: 'Pago', amount: 50, phone: '(17) 91000-3428', notes: 'Pré-Convite' },
    { id: 'part-8', name: 'Isabela Nascimento Marotto', category: 'Participante', size: 'G', status: 'Pago', amount: 100, phone: '(17) 99113-4769', notes: 'Experience' },
    { id: 'part-9', name: 'Isadora Abreu', category: 'Participante', size: 'P', status: 'Pago', amount: 50, phone: '(17) 99658-1235', notes: 'Pré-Convite' },
    { id: 'part-10', name: 'Ísis Eduarda de Brito Pinheiro', category: 'Participante', size: 'P', status: 'Pago', amount: 70, phone: '(17) 98221-1269', notes: 'Com Camiseta' },
    { id: 'part-11', name: 'Izadora de Jesus Estopa', category: 'Participante', size: 'P', status: 'Pago', amount: 50, phone: '(35) 98424-5785', notes: 'Pré-Convite' },
    { id: 'part-12', name: 'Izadora Siviero de Souza', category: 'Participante', size: 'P', status: 'Pago', amount: 50, phone: '(17) 99211-3565', notes: 'Pré-Convite' },
    { id: 'part-13', name: 'José Otávio Prado Marotto', category: 'Participante', size: 'P', status: 'Pago', amount: 50, phone: '(17) 99669-8684', notes: 'Pré-Convite' },
    { id: 'part-14', name: 'Kauã Alves das Dores', category: 'Participante', size: 'G', status: 'Pago', amount: 50, phone: '(17) 99785-2292', notes: 'Pré-Convite (Pago p/ Gisele)' },
    { id: 'part-15', name: 'Laura Mandotti Perondi', category: 'Participante', size: 'P', status: 'Pago', amount: 50, phone: '(17) 99193-8301', notes: 'Pré-Convite' },
    { id: 'part-16', name: 'Lívia Maysa Belmonte', category: 'Participante', size: 'P', status: 'Pago', amount: 50, phone: '(17) 99126-0259', notes: 'Pré-Convite' },
    { id: 'part-17', name: 'Lorena Pereira Tomazela', category: 'Participante', size: 'P', status: 'Pago', amount: 50, phone: '(17) 99728-1527', notes: 'Pré-Convite' },
    { id: 'part-18', name: 'Lucas Gabriel Salas da Silva', category: 'Participante', size: 'G', status: 'Pago', amount: 50, phone: '(17) 98138-8610', notes: 'Pré-Convite (Pago p/ Gisele)' },
    { id: 'part-19', name: 'Maria Elisa Lima Alves', category: 'Participante', size: 'P', status: 'Pago', amount: 50, phone: '(17) 99210-5488', notes: 'Pré-Convite' },
    { id: 'part-20', name: 'Maria Fernanda Escada Martins', category: 'Participante', size: 'P', status: 'Pago', amount: 50, phone: '(14) 99777-9479', notes: 'Pré-Convite' },
    { id: 'part-21', name: 'Pietra Nicole Zadi Caraschi', category: 'Participante', size: 'P', status: 'Pago', amount: 50, phone: '(17) 99193-3540', notes: 'Pré-Convite' },
    { id: 'part-22', name: 'Rafaela Trovo Cardoso Yago', category: 'Participante', size: 'P', status: 'Pago', amount: 70, phone: '(16) 99620-4425', notes: 'Com Camiseta' },
    { id: 'part-23', name: 'Renata de Sousa', category: 'Participante', size: 'P', status: 'Pago', amount: 50, phone: '(17) 98833-0503', notes: 'Pré-Convite' },

    // --- ANJOS PAGOS (17) ---
    { id: 'anjo-1', name: 'Wagner', category: 'Anjo', size: 'GG', status: 'Pago', notes: 'Coordenação' },
    { id: 'anjo-2', name: 'Flavia', category: 'Anjo', size: 'GG', status: 'Pago', notes: 'Equipe Anjo' },
    { id: 'anjo-3', name: 'Felipe', category: 'Anjo', size: 'GG', status: 'Pago', notes: 'Equipe Anjo' },
    { id: 'anjo-4', name: 'Eduardo', category: 'Anjo', size: 'GG', status: 'Pago', notes: 'Equipe Anjo' },
    { id: 'anjo-5', name: 'João Vitor', category: 'Anjo', size: 'GG', status: 'Pago', notes: 'Equipe Anjo' },
    { id: 'anjo-6', name: 'Mandotti', category: 'Anjo', size: 'G2', status: 'Pago', notes: 'Equipe Anjo' },
    { id: 'anjo-7', name: 'Simone', category: 'Anjo', size: 'G', status: 'Pago', notes: 'Equipe Anjo' },
    { id: 'anjo-8', name: 'Rafael', category: 'Anjo', size: 'M', status: 'Pago', notes: 'Equipe Anjo' },
    { id: 'anjo-9', name: 'Rabachin', category: 'Anjo', size: 'M', status: 'Pago', notes: 'Equipe Anjo' },
    { id: 'anjo-10', name: 'Cassiano', category: 'Anjo', size: 'M', status: 'Pago', notes: 'Equipe Anjo' },
    { id: 'anjo-11', name: 'Gabriel E.', category: 'Anjo', size: 'M', status: 'Pago', notes: 'Equipe Anjo' },
    { id: 'anjo-12', name: 'Julia', category: 'Anjo', size: 'P', status: 'Pago', notes: 'Equipe Anjo' },
    { id: 'anjo-13', name: 'Mabel', category: 'Anjo', size: 'P', status: 'Pago', notes: 'Equipe Anjo' },
    { id: 'anjo-14', name: 'Maria Fernanda', category: 'Anjo', size: 'P', status: 'Pago', notes: 'Equipe Anjo' },
    { id: 'anjo-15', name: 'Marie', category: 'Anjo', size: 'P', status: 'Pago', notes: 'Equipe Anjo' },
    { id: 'anjo-16', name: 'Leonardo', category: 'Anjo', size: 'EXG', status: 'Pago', notes: 'Equipe Anjo' },
    { id: 'anjo-17', name: 'Elisangela', category: 'Anjo', size: 'EXG', status: 'Pago', notes: 'Equipe Anjo' },

    // --- FAMÍLIA ROSA MARIA (3) ---
    { id: 'avulso-1', name: 'Filha da Rosa Maria', category: 'Avulso', size: 'PP', status: 'Pago', notes: 'Tamanho 16 / PP Infantil' },
    { id: 'avulso-2', name: 'Rosa Maria', category: 'Avulso', size: 'P', status: 'Pago', notes: 'Venda Avulsa' },
    { id: 'avulso-3', name: 'Esposo da Rosa Maria', category: 'Avulso', size: 'G1', status: 'Pago', notes: 'Venda Avulsa' },

    // --- PARTICIPANTES PENDENTES (19 participantes / 20 camisetas) ---
    { id: 'part-pend-1', name: 'Ana Clara de Souza Ribeiro', category: 'Participante', size: 'P', status: 'Pendente', amount: 50, phone: '(17) 99676-8296' },
    { id: 'part-pend-2', name: 'Anne dos Santos Siviero', category: 'Participante', size: 'P', status: 'Pendente', amount: 50, phone: '(17) 99731-3527' },
    { id: 'part-pend-3', name: 'Francieli Serafim dos Santos', category: 'Participante', size: 'P', status: 'Pendente', amount: 50, phone: '(17) 99655-7603' },
    { id: 'part-pend-4', name: 'Júlia de Farias Paes', category: 'Participante', size: 'P', status: 'Pendente', amount: 50, phone: '(17) 99207-5255' },
    { id: 'part-pend-5', name: 'Júlia Cristina de Souza Pereira', category: 'Participante', size: 'P', status: 'Pendente', amount: 50, phone: '(17) 99738-1094' },
    { id: 'part-pend-6', name: 'Leonardo Rodrigues do Prado', category: 'Participante', size: 'P', status: 'Pendente', amount: 50, phone: '(17) 99153-2595' },
    { id: 'part-pend-7', name: 'Maria Júlia Sampaio Pereira', category: 'Participante', size: 'P', status: 'Pendente', amount: 50, phone: '(17) 99273-0230' },
    { id: 'part-pend-8', name: 'Maria Luíza Siviero de Oliveira', category: 'Participante', size: 'P', status: 'Pendente', amount: 50, phone: '(17) 99198-5887' },
    { id: 'part-pend-9', name: 'Miguel Scherite', category: 'Participante', size: 'P', status: 'Pendente', amount: 50, phone: '(17) 99214-0331' },
    { id: 'part-pend-10', name: 'Otávio Aparecido Vidal', category: 'Participante', size: 'P', status: 'Pendente', amount: 50, phone: '(16) 99752-2641' },
    { id: 'part-pend-11', name: 'Pietra dos Santos (1ª)', category: 'Participante', size: 'P', status: 'Pendente', amount: 50, phone: '(17) 98804-2120', notes: 'Kit Duo' },
    { id: 'part-pend-12', name: 'Pietra dos Santos (2ª / Amigo)', category: 'Participante', size: 'P', status: 'Pendente', amount: 50, phone: '(17) 98804-2120', notes: 'Kit Duo Amigo' },
    { id: 'part-pend-13', name: 'Victor Hugo Quintiliano', category: 'Participante', size: 'P', status: 'Pendente', amount: 50, phone: '(17) 99125-3816' },
    { id: 'part-pend-14', name: 'Ana Clara Moreira', category: 'Participante', size: 'M', status: 'Pendente', amount: 100, phone: '(17) 98170-7522', notes: 'Experience' },
    { id: 'part-pend-15', name: 'Bryan Henrique Broesler da Silva', category: 'Participante', size: 'M', status: 'Pendente', amount: 50, phone: '(17) 99187-7730' },
    { id: 'part-pend-16', name: 'Cauã Sagiori', category: 'Participante', size: 'M', status: 'Pendente', amount: 50, phone: '(17) 99109-3232' },
    { id: 'part-pend-17', name: 'Gabriel Henrique Monteiro Ramos', category: 'Participante', size: 'M', status: 'Pendente', amount: 50, phone: '(17) 99145-9981' },
    { id: 'part-pend-18', name: 'Gabriel Milanezi Silva', category: 'Participante', size: 'M', status: 'Pendente', amount: 50, phone: '(17) 99701-1154' },
    { id: 'part-pend-19', name: 'Kaio Gomes Braga', category: 'Participante', size: 'M', status: 'Pendente', amount: 50, phone: '(17) 99611-5759' },
    { id: 'part-pend-20', name: 'João Vitor Silva', category: 'Participante', size: 'G', status: 'Pendente', amount: 50, phone: '(17) 98226-8286' },

    // --- ANJOS PENDENTES (4) ---
    { id: 'anjo-pend-1', name: 'João Pedro', category: 'Anjo', size: 'M', status: 'Pendente', notes: 'Equipe Anjo' },
    { id: 'anjo-pend-2', name: 'Machado', category: 'Anjo', size: 'G', status: 'Pendente', notes: 'Equipe Anjo' },
    { id: 'anjo-pend-3', name: 'Pedro Harada', category: 'Anjo', size: 'GG', status: 'Pendente', notes: 'Equipe Anjo' },
    { id: 'anjo-pend-4', name: 'Varini', category: 'Anjo', size: 'GG', status: 'Pendente', notes: 'Equipe Anjo' }
]

export default function TshirtOrdersAdmin() {
    const [orders, setOrders] = useState<TshirtOrderItem[]>(INITIAL_TSHIRT_ORDERS)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterCategory, setFilterCategory] = useState<string>('Todos')
    const [filterSize, setFilterSize] = useState<string>('Todos')
    const [filterStatus, setFilterStatus] = useState<string>('Todos')
    const [activeTab, setActiveTab] = useState<'list' | 'production'>('list')

    // Modal para Adicionar Novo Pedido
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [newName, setNewName] = useState('')
    const [newCategory, setNewCategory] = useState<'Participante' | 'Anjo' | 'Avulso'>('Avulso')
    const [newSize, setNewSize] = useState<TshirtOrderItem['size']>('M')
    const [newStatus, setNewStatus] = useState<'Pago' | 'Pendente'>('Pago')
    const [newPhone, setNewPhone] = useState('')
    const [newNotes, setNewNotes] = useState('')

    // Alternar status de pagamento
    const toggleStatus = (id: string) => {
        setOrders(prev => prev.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    status: item.status === 'Pago' ? 'Pendente' : 'Pago'
                }
            }
            return item
        }))
    }

    const handleAddOrder = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newName.trim()) return

        const newItem: TshirtOrderItem = {
            id: `custom-${Date.now()}`,
            name: newName.trim(),
            category: newCategory,
            size: newSize,
            status: newStatus,
            phone: newPhone.trim() || undefined,
            notes: newNotes.trim() || undefined
        }

        setOrders(prev => [newItem, ...prev])
        setIsAddModalOpen(false)
        setNewName('')
        setNewPhone('')
        setNewNotes('')
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
    const SIZES_ORDER: TshirtOrderItem['size'][] = ['PP', 'P', 'M', 'G', 'GG', 'G1', 'G2', 'EXG']

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
        const headers = ['#', 'Nome', 'Categoria', 'Tamanho', 'Status Pagamento', 'Telefone', 'Observações']
        const rows = filteredOrders.map((item, idx) => [
            idx + 1,
            `"${item.name}"`,
            `"${item.category}"`,
            `"${item.size}"`,
            `"${item.status}"`,
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

    // Impressão rápida
    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
            {/* CABEÇALHO */}
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
                                Controle de confecção unificado: Participantes, Anjos e Vendas Avulsas.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
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
                        onClick={handlePrint}
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
                                ✅ Pagas & Garantidas
                            </span>
                            <div className="text-4xl font-black text-white">{totalPaid}</div>
                            <span className="text-xs text-gray-400 mt-1 block">Produção 100% garantida</span>
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
                            <span className="text-xs text-gray-400 mt-1 block">Aguardando PIX / Comprovante</span>
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
                            <span className="text-xs text-gray-400 mt-1 block">Demanda máxima de confecção</span>
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
                        (Pagos + Pendentes)
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
                                        ? 'bg-holi-primary/20 border-holi-primary shadow-lg shadow-holi-primary/20'
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

            {/* BARRA DE FILTROS & ABAS */}
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
                        Guia de Produção / Gráfica
                    </button>
                </div>
            </div>

            {/* TAB 1: LISTAGEM COMPLETA DETALHADA */}
            {activeTab === 'list' && (
                <div className="bg-holi-surface border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-black/40 text-[11px] uppercase tracking-wider text-gray-400">
                                    <th className="py-4 px-6">#</th>
                                    <th className="py-4 px-6">Nome</th>
                                    <th className="py-4 px-4">Categoria</th>
                                    <th className="py-4 px-4 text-center">Tamanho</th>
                                    <th className="py-4 px-4">Status Pagamento</th>
                                    <th className="py-4 px-6">Contato / Observações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {filteredOrders.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="py-4 px-6 text-gray-500 font-mono text-xs">
                                            {idx + 1}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="font-bold text-white flex items-center gap-2">
                                                {item.name}
                                            </div>
                                        </td>
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
                                        <td className="py-4 px-4 text-center">
                                            <span className="inline-block px-3 py-1 rounded-xl bg-white/10 text-holi-secondary font-mono font-black text-sm border border-white/10">
                                                {item.size}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus(item.id)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                                    item.status === 'Pago'
                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                                                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
                                                }`}
                                            >
                                                {item.status === 'Pago' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                                {item.status}
                                            </button>
                                        </td>
                                        <td className="py-4 px-6 text-xs text-gray-400">
                                            <div className="flex flex-col">
                                                {item.phone && <span className="text-gray-300">{item.phone}</span>}
                                                {item.notes && <span className="text-gray-500">{item.notes}</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
                                    Resumo para Envio à Estamparia / Gráfica
                                </h3>
                                <p className="text-gray-400 text-xs">
                                    Valores totalizados para corte, costura e estamparia das camisetas do Retiro ADONAI 2026.
                                </p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 bg-black/40 text-xs uppercase tracking-wider text-gray-400">
                                        <th className="py-3 px-4">Tamanho</th>
                                        <th className="py-3 px-4 text-center">Garantido (Pago)</th>
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

            {/* MODAL: ADICIONAR NOVO PEDIDO DE CAMISETA */}
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
                                onClick={() => setIsAddModalOpen(false)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-holi-primary/20 border border-holi-primary/30 flex items-center justify-center text-holi-primary">
                                    <Plus size={20} />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                                    Adicionar Camiseta
                                </h3>
                            </div>

                            <form onSubmit={handleAddOrder} className="space-y-4 text-sm">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                                        Nome Completo
                                    </label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
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
                                            value={newCategory}
                                            onChange={e => setNewCategory(e.target.value as any)}
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
                                            value={newSize}
                                            onChange={e => setNewSize(e.target.value as any)}
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
                                            value={newStatus}
                                            onChange={e => setNewStatus(e.target.value as any)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-holi-primary"
                                        >
                                            <option value="Pago">✅ Já Pago</option>
                                            <option value="Pendente">⏳ Pendente</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                                            Telefone (Opcional)
                                        </label>
                                        <input
                                            type="text"
                                            value={newPhone}
                                            onChange={e => setNewPhone(e.target.value)}
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
                                        value={newNotes}
                                        onChange={e => setNewNotes(e.target.value)}
                                        placeholder="Ex: Pago em dinheiro / avulso"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-holi-primary"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase cursor-pointer"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 rounded-xl bg-holi-primary hover:bg-holi-primary/80 text-white font-black text-xs uppercase cursor-pointer shadow-lg shadow-holi-primary/30"
                                    >
                                        Salvar Pedido
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
