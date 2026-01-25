import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Search, Filter, Plus, Save, X, PlusCircle, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface DonationItem {
    id: string
    name: string
    quantity: string
    category: string
    checked: boolean
    received: string | null
}

const DonationAdmin = () => {
    const [items, setItems] = useState<DonationItem[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterCategory, setFilterCategory] = useState('Todas')

    // Partial Edit State
    const [editingPartial, setEditingPartial] = useState<DonationItem | null>(null)
    const [partialInput, setPartialInput] = useState('')

    // New Item State
    const [isAdding, setIsAdding] = useState(false)
    const [newItem, setNewItem] = useState<{
        name: string,
        quantity: string,
        category: string,
        isReceived: boolean
    }>({
        name: '',
        quantity: '',
        category: 'Despensa & Básicos',
        isReceived: false
    })

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('donation_items')
            .select('*')
            .order('category', { ascending: true })
            .order('name', { ascending: true })

        if (error) {
            console.error('Error fetching items:', error)
            alert('Erro ao buscar itens de doação.')
        } else {
            setItems(data || [])
        }
        setLoading(false)
    }

    const toggleItem = async (id: string, currentStatus: boolean) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, checked: !currentStatus } : item))

        const { error } = await supabase
            .from('donation_items')
            .update({ checked: !currentStatus })
            .eq('id', id)

        if (error) {
            alert('Erro ao atualizar item.')
            fetchItems()
        }
    }

    const parseQty = (str: string) => {
        const match = str.match(/(\d+(?:[.,]\d+)?)\s*(.*)/)
        if (!match) return { val: 0, unit: '' }
        return { val: parseFloat(match[1].replace(',', '.')), unit: match[2] }
    }

    const openPartialModal = (e: React.MouseEvent, item: DonationItem) => {
        e.stopPropagation()
        setEditingPartial(item)
        setPartialInput('')
    }

    const handleSavePartial = async () => {
        if (!editingPartial || !partialInput) return

        const amountToAdd = parseFloat(partialInput.replace(',', '.'))
        if (isNaN(amountToAdd)) return alert('Digite um número válido')

        const { val: currentVal, unit } = parseQty(editingPartial.received || '0 ' + parseQty(editingPartial.quantity).unit)
        const { val: targetVal } = parseQty(editingPartial.quantity)

        const newVal = currentVal + amountToAdd
        const newReceivedStr = `${newVal} ${unit}`.trim()
        const isComplete = newVal >= targetVal

        setItems(prev => prev.map(item => item.id === editingPartial.id ? {
            ...item,
            received: newReceivedStr,
            checked: isComplete ? true : item.checked
        } : item))

        setEditingPartial(null)

        const { error } = await supabase
            .from('donation_items')
            .update({
                received: newReceivedStr,
                checked: isComplete ? true : editingPartial.checked
            })
            .eq('id', editingPartial.id)

        if (error) {
            alert('Erro ao salvar: ' + error.message)
            fetchItems()
        }
    }

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newItem.name || !newItem.quantity) return alert('Preencha nome e quantidade')

        const itemPayload = {
            name: newItem.name,
            quantity: newItem.quantity,
            category: newItem.category,
            checked: newItem.isReceived,
            received: newItem.isReceived ? newItem.quantity : null
        }

        const { data, error } = await supabase
            .from('donation_items')
            .insert([itemPayload])
            .select()

        if (error) {
            alert('Erro ao adicionar: ' + error.message)
        } else {
            if (data) setItems(prev => [...prev, ...data])
            setIsAdding(false)
            setNewItem({ name: '', quantity: '', category: 'Despensa & Básicos', isReceived: false })
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este item?')) return
        const { error } = await supabase
            .from('donation_items')
            .delete()
            .eq('id', id)

        if (error) {
            alert('Erro ao excluir: ' + error.message)
        } else {
            setItems(prev => prev.filter(i => i.id !== id))
        }
    }

    const categories = ['Todas', ...Array.from(new Set(items.map(i => i.category))).sort()]
    // Unique categories for the dropdown (exclude 'Todas')
    const addCategories = Array.from(new Set(items.map(i => i.category))).sort()

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = filterCategory === 'Todas' || item.category === filterCategory
        return matchesSearch && matchesCategory
    })

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-white/10 pb-8">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter flex items-center gap-3 text-white">
                        Gestão de <span className="text-holi-secondary">Doações</span>
                    </h1>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-holi-secondary hover:bg-white text-black font-bold px-6 py-4 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:scale-105 uppercase tracking-wide text-sm"
                >
                    <PlusCircle size={20} />
                    Novo Item
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-4 z-20 bg-[#050208]/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 text-white">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar item..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-holi-secondary outline-none text-white"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-10 outline-none appearance-none font-bold text-sm h-full text-white"
                    >
                        {categories.map(cat => <option key={cat} className="bg-black text-white">{cat}</option>)}
                    </select>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="text-center py-20 text-gray-500 font-marker animate-pulse">Carregando estoque...</div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {categories.filter(c => c !== 'Todas' && (filterCategory === 'Todas' || filterCategory === c)).map(cat => {
                        const catItems = filteredItems.filter(i => i.category === cat)
                        if (catItems.length === 0) return null

                        return (
                            <div key={cat} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8">
                                <h2 className="text-xl font-black uppercase tracking-widest text-holi-secondary mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                                    {cat}
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {catItems.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => toggleItem(item.id, item.checked)}
                                            className={`
                                                relative p-4 rounded-xl border-2 transition-all cursor-pointer group select-none flex flex-col gap-3
                                                ${item.checked
                                                    ? 'bg-green-500/10 border-green-500/30'
                                                    : 'bg-black/40 border-white/5 hover:border-holi-secondary/50'
                                                }
                                            `}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className={`font-bold ${item.checked ? 'text-green-500 line-through opacity-70' : 'text-gray-100'}`}>
                                                        {item.name}
                                                    </h3>
                                                    <span className={`text-xs font-mono uppercase ${item.checked ? 'text-green-500/60' : 'text-gray-500'}`}>
                                                        {item.quantity}
                                                    </span>
                                                </div>

                                                <div className={`
                                                    w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                                                    ${item.checked
                                                        ? 'bg-green-500 border-green-500 text-black scale-110'
                                                        : 'border-white/20 text-transparent group-hover:border-holi-secondary'
                                                    }
                                                `}>
                                                    <Check size={16} strokeWidth={4} />
                                                </div>
                                            </div>

                                            {/* Partial Bar / Info */}
                                            <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                                                <div className="text-[10px] uppercase font-bold text-gray-400">
                                                    Recebido: <span className="text-white">{item.received || 0}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}
                                                        className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-1.5 rounded-lg transition-colors"
                                                        title="Excluir Item"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => openPartialModal(e, item)}
                                                        className="bg-holi-secondary/20 hover:bg-holi-secondary text-holi-secondary hover:text-black p-1.5 rounded-lg transition-colors"
                                                        title="Lançar Parcial"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Modal de Lançamento Parcial */}
            <AnimatePresence>
                {editingPartial && (
                    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-holi-surface border border-white/10 w-full max-w-sm rounded-3xl p-8 relative"
                        >
                            <button onClick={() => setEditingPartial(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>

                            <h3 className="text-xl font-black uppercase tracking-tight text-white mb-1">Lançar Doação</h3>
                            <p className="text-sm text-gray-500 mb-6">{editingPartial.name}</p>

                            <div className="bg-black/30 p-4 rounded-xl mb-6">
                                <div className="flex justify-between text-xs font-bold uppercase text-gray-500 mb-1">
                                    <span>Meta Total</span>
                                    <span>Já Recebido</span>
                                </div>
                                <div className="flex justify-between text-white font-mono">
                                    <span>{editingPartial.quantity}</span>
                                    <span>{editingPartial.received || 'Nada'}</span>
                                </div>
                            </div>

                            <label className="block mb-6">
                                <span className="text-xs font-bold uppercase text-gray-500 mb-2 block">Quantidade recebida AGORA</span>
                                <input
                                    type="number"
                                    autoFocus
                                    value={partialInput}
                                    onChange={(e) => setPartialInput(e.target.value)}
                                    placeholder="Ex: 2"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-lg focus:border-holi-secondary outline-none"
                                />
                                <p className="text-[10px] text-gray-600 mt-2">
                                    O sistema somará este valor ao total já recebido.
                                </p>
                            </label>

                            <button
                                onClick={handleSavePartial}
                                className="w-full bg-holi-secondary text-black font-black py-4 rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg"
                            >
                                <Save size={18} /> Confirmar Lance
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Novo Item */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-holi-surface border border-white/10 w-full max-w-md rounded-3xl p-8 relative"
                        >
                            <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>

                            <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Novo Pedido</h3>
                            <p className="text-sm text-gray-500 mb-8">Cadastre algo que o retiro precisa ou que você acabou de ganhar.</p>

                            <form onSubmit={handleAddItem} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">O que precisamos? (Nome)</label>
                                    <input
                                        type="text"
                                        value={newItem.name}
                                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-holi-secondary outline-none text-white"
                                        placeholder="Ex: Limão"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Quantidade / Meta</label>
                                    <input
                                        type="text"
                                        value={newItem.quantity}
                                        onChange={e => setNewItem({ ...newItem, quantity: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-holi-secondary outline-none text-white"
                                        placeholder="Ex: 2 caixas"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Categoria</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={newItem.category}
                                            onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                            className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-holi-secondary outline-none text-white appearance-none"
                                        >
                                            {addCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            <option value="Outros">Outros / Nova</option>
                                        </select>
                                    </div>
                                    {newItem.category === 'Outros' && (
                                        <input
                                            type="text"
                                            className="w-full mt-2 bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-holi-secondary outline-none text-white animate-fade-in"
                                            placeholder="Nome da nova categoria..."
                                            onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                        />
                                    )}
                                </div>

                                <div className="pt-4 border-t border-white/5 mt-6">
                                    <label className="flex items-center gap-4 cursor-pointer group">
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${newItem.isReceived ? 'bg-green-500 border-green-500' : 'border-white/20 group-hover:border-white'}`}>
                                            {newItem.isReceived && <Check size={14} className="text-black" />}
                                        </div>
                                        <div>
                                            <span className="block text-sm font-bold text-white">Já ganhamos isso?</span>
                                            <span className="block text-xs text-gray-500">Marque se você já tem esse item em mãos.</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={newItem.isReceived}
                                            onChange={e => setNewItem({ ...newItem, isReceived: e.target.checked })}
                                        />
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-holi-secondary text-black font-black py-4 rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 mt-4 uppercase tracking-widest shadow-lg"
                                >
                                    <PlusCircle size={18} /> Adicionar à Lista
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default DonationAdmin
