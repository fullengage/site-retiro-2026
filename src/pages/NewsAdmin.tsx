import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Edit2, Save, Shield, UserPlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface NewsItem {
    id: string
    type: 'standard' | 'photo' | 'urgent' | 'quote' | 'list' | 'weather' | 'wanted' | 'grid' | 'invitation' | 'stats'
    bg: string
    title?: string
    subtitle?: string
    tag?: string
    content?: string
    full_content?: string
    items?: string[]
    full_items?: string[]
    img?: string
    images?: string[]
    caption?: string
    marker?: string
    rotate: string
    torn: boolean
    hot: boolean
    tape: boolean
    author?: string
    temp?: string
    desc_weather?: string
    full_desc_weather?: string
    quote: boolean
    order_index: number
}

const NewsAdmin = () => {
    // Context from AdminLayout
    const { user, userRole } = useOutletContext<{ user: any, userRole: 'admin' | 'redator' }>()

    const [news, setNews] = useState<NewsItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [editingItem, setEditingItem] = useState<Partial<NewsItem> | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Redatores Management
    const [showEditors, setShowEditors] = useState(false)
    const [editors, setEditors] = useState<any[]>([])
    const [newEditorEmail, setNewEditorEmail] = useState('')
    const [newEditorRole, setNewEditorRole] = useState<'admin' | 'redator'>('redator')

    useEffect(() => {
        fetchNews()
        if (userRole === 'admin') {
            fetchEditors()
        }
    }, [userRole])

    const fetchEditors = async () => {
        const { data } = await supabase.from('news_editors').select('*').order('created_at')
        if (data) setEditors(data)
    }

    const handleAddEditor = async (e: React.FormEvent) => {
        e.preventDefault()
        const { error } = await supabase
            .from('news_editors')
            .insert([{ email: newEditorEmail, role: newEditorRole }])

        if (error) {
            alert('Erro ao adicionar: ' + error.message)
        } else {
            setNewEditorEmail('')
            fetchEditors()
        }
    }

    const handleRemoveEditor = async (id: string, editorEmail: string) => {
        if (editorEmail === 'richard.fullweb@gmail.com') return alert('O admin principal não pode ser removido.')
        if (!confirm('Remover este redator?')) return

        const { error } = await supabase.from('news_editors').delete().eq('id', id)
        if (error) alert('Erro ao remover: ' + error.message)
        else fetchEditors()
    }

    const fetchNews = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('news')
            .select('*')
            .order('order_index', { ascending: true })

        if (error) {
            setError('Erro ao carregar notícias: ' + error.message)
        } else {
            setNews(data || [])
        }
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta notícia?')) return

        const { error } = await supabase
            .from('news')
            .delete()
            .eq('id', id)

        if (error) {
            alert('Erro ao excluir: ' + error.message)
        } else {
            setNews(news.filter(n => n.id !== id))
        }
    }

    const handleSave = async (item: Partial<NewsItem>) => {
        const { error } = await supabase
            .from('news')
            .upsert(item)
            .select()

        if (error) {
            alert('Erro ao salvar: ' + error.message)
        } else {
            setIsAdding(false)
            setEditingItem(null)
            fetchNews()
        }
    }

    if (loading) return <div className="text-white flex items-center justify-center font-marker text-2xl h-64">Carregando painel...</div>

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Painel de Notícias</h1>
                    <p className="text-gray-500 font-mono text-sm mt-2">GERENCIAMENTO DE CONTEÚDO</p>
                </div>
                <div className="flex gap-4">
                    {userRole === 'admin' && (
                        <button
                            onClick={() => setShowEditors(!showEditors)}
                            className={`px-6 py-4 rounded-full font-bold flex items-center gap-2 transition-all border-2 ${showEditors ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white/10 hover:border-white/40'}`}
                        >
                            <UserPlus size={20} />
                            {showEditors ? 'Ver Notícias' : 'Redatores'}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setEditingItem({
                                type: 'standard',
                                bg: 'bg-[#fdfbf7]',
                                rotate: 'rotate-0',
                                torn: true,
                                order_index: news.length
                            })
                            setIsAdding(true)
                        }}
                        className="bg-holi-primary hover:bg-holi-primary/80 text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-holi-primary/30"
                    >
                        <Plus size={20} />
                        Nova Matéria
                    </button>
                </div>
            </div>

            {error && <div className="bg-red-500/20 border border-red-500 text-red-500 p-4 mb-8 rounded-xl">{error}</div>}

            {showEditors && userRole === 'admin' ? (
                <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
                    <div className="p-8 border-b border-white/10 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 text-white">
                                <Shield className="text-holi-primary" /> Gerenciar Equipe
                            </h2>
                            <p className="text-gray-500 text-xs font-mono mt-1">CADASTRO DE REDATORES AUTORIZADOS</p>
                        </div>
                    </div>

                    <div className="p-8">
                        <form onSubmit={handleAddEditor} className="flex gap-4 mb-10 p-6 bg-black/40 rounded-3xl border border-white/5">
                            <div className="flex-1">
                                <input
                                    type="email"
                                    value={newEditorEmail}
                                    onChange={(e) => setNewEditorEmail(e.target.value)}
                                    placeholder="E-mail do novo redator"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-holi-primary outline-none font-mono text-white"
                                    required
                                />
                            </div>
                            <select
                                value={newEditorRole}
                                onChange={(e) => setNewEditorRole(e.target.value as any)}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none text-white appearance-none"
                            >
                                <option value="redator" className="bg-gray-900 text-white">Redator</option>
                                <option value="admin" className="bg-gray-900 text-white">Admin</option>
                            </select>
                            <button type="submit" className="bg-holi-primary hover:bg-holi-primary/80 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all">
                                <UserPlus size={18} /> Adicionar
                            </button>
                        </form>

                        <div className="space-y-3">
                            {editors.map((editor) => (
                                <div key={editor.id} className="flex justify-between items-center p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${editor.role === 'admin' ? 'bg-holi-primary/20 text-holi-primary' : 'bg-gray-700/50 text-gray-400'}`}>
                                            {editor.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold flex items-center gap-2 text-white">
                                                {editor.email}
                                                {editor.role === 'admin' && <Shield size={12} className="text-holi-primary" />}
                                            </div>
                                            <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{editor.role}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveEditor(editor.id, editor.email)}
                                        className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                        title="Remover Acesso"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {news.map((item) => (
                        <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative group overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-holi-accent/20 text-holi-accent px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest">{item.type}</span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditingItem(item); setIsAdding(true); }} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-blue-400"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-500"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <h3 className="font-bold text-lg mb-2 truncate text-white">{item.title || item.marker || 'Sem título'}</h3>
                            <p className="text-gray-400 text-sm line-clamp-3 mb-4">{item.content}</p>
                            <div className="text-[10px] text-gray-600 font-mono uppercase tracking-tighter">ORDEM: {item.order_index} • {item.type}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Edição - Mantendo a mesma estrutura mas usando Portal se necessário, ou apenas overlay fixo */}
            <AnimatePresence>
                {isAdding && editingItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white text-gray-900 w-full max-w-4xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl my-8 overflow-y-auto max-h-[90vh]"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-black uppercase tracking-tight">Editar Matéria</h2>
                                <button onClick={() => setIsAdding(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"><X size={24} /></button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="block">
                                        <span className="text-xs font-bold uppercase text-gray-500 mb-2 block">Tipo de Card</span>
                                        <select
                                            value={editingItem.type}
                                            onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as any })}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-holi-primary outline-none transition-all"
                                        >
                                            <option value="standard">Padrão (Jornal)</option>
                                            <option value="photo">Foto com Fita</option>
                                            <option value="urgent">Urgente (Vermelho)</option>
                                            <option value="quote">Citação</option>
                                            <option value="list">Lista/Checklist</option>
                                            <option value="weather">Clima</option>
                                            <option value="wanted">Procura-se</option>
                                            <option value="grid">Painel de Memórias</option>
                                            <option value="invitation">Convite</option>
                                            <option value="stats">Estatísticas/Números</option>
                                        </select>
                                    </label>

                                    <label className="block">
                                        <span className="text-xs font-bold uppercase text-gray-500 mb-2 block">Título / Manchete</span>
                                        <input
                                            type="text"
                                            value={editingItem.title || ''}
                                            onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-holi-primary outline-none transition-all"
                                            placeholder="Ex: Vai ter Camping!"
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="text-xs font-bold uppercase text-gray-500 mb-2 block">Subtítulo / Jornal</span>
                                        <input
                                            type="text"
                                            value={editingItem.subtitle || ''}
                                            onChange={(e) => setEditingItem({ ...editingItem, subtitle: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-holi-primary outline-none transition-all"
                                            placeholder="Ex: O Diário do Peregrino"
                                        />
                                    </label>

                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="block">
                                            <span className="text-xs font-bold uppercase text-gray-500 mb-2 block">Tag (Pequena)</span>
                                            <input
                                                type="text"
                                                value={editingItem.tag || ''}
                                                onChange={(e) => setEditingItem({ ...editingItem, tag: e.target.value })}
                                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-holi-primary outline-none transition-all"
                                                placeholder="Ex: NOVIDADE"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-xs font-bold uppercase text-gray-500 mb-2 block">Marker / Sticker</span>
                                            <input
                                                type="text"
                                                value={editingItem.marker || ''}
                                                onChange={(e) => setEditingItem({ ...editingItem, marker: e.target.value })}
                                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-holi-primary outline-none transition-all"
                                                placeholder="Ex: Atualizado"
                                            />
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="block">
                                            <span className="text-xs font-bold uppercase text-gray-500 mb-2 block">Rotação</span>
                                            <select
                                                value={editingItem.rotate}
                                                onChange={(e) => setEditingItem({ ...editingItem, rotate: e.target.value })}
                                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-holi-primary outline-none transition-all"
                                            >
                                                <option value="rotate-1">Direita (Leve)</option>
                                                <option value="-rotate-1">Esquerda (Leve)</option>
                                                <option value="rotate-2">Direita (Média)</option>
                                                <option value="-rotate-2">Esquerda (Média)</option>
                                                <option value="rotate-3">Direita (Forte)</option>
                                                <option value="rotate-6">Dramática</option>
                                                <option value="rotate-0">Reta</option>
                                            </select>
                                        </label>
                                        <label className="block">
                                            <span className="text-xs font-bold uppercase text-gray-500 mb-2 block">Ordem (0-12)</span>
                                            <input
                                                type="number"
                                                value={editingItem.order_index}
                                                onChange={(e) => setEditingItem({ ...editingItem, order_index: parseInt(e.target.value) })}
                                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-holi-primary outline-none transition-all"
                                            />
                                        </label>
                                    </div>

                                    {editingItem.type === 'weather' && (
                                        <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-100 grid grid-cols-2 gap-4">
                                            <label className="block col-span-1">
                                                <span className="text-[10px] font-bold uppercase text-blue-400 mb-1 block">Temperatura</span>
                                                <input
                                                    type="text"
                                                    value={editingItem.temp || ''}
                                                    onChange={(e) => setEditingItem({ ...editingItem, temp: e.target.value })}
                                                    className="w-full bg-white px-3 py-2 rounded-lg text-sm outline-none"
                                                    placeholder="30°C"
                                                />
                                            </label>
                                            <label className="block col-span-1">
                                                <span className="text-[10px] font-bold uppercase text-blue-400 mb-1 block">Condição</span>
                                                <input
                                                    type="text"
                                                    value={editingItem.desc_weather || ''}
                                                    onChange={(e) => setEditingItem({ ...editingItem, desc_weather: e.target.value })}
                                                    className="w-full bg-white px-3 py-2 rounded-lg text-sm outline-none"
                                                    placeholder="Sol"
                                                />
                                            </label>
                                        </div>
                                    )}

                                    <label className="block">
                                        <span className="text-xs font-bold uppercase text-gray-500 mb-2 block">Cor de Fundo</span>
                                        <select
                                            value={editingItem.bg}
                                            onChange={(e) => setEditingItem({ ...editingItem, bg: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-holi-primary outline-none transition-all"
                                        >
                                            <option value="bg-[#fdfbf7]">Papel Antigo (Padrão)</option>
                                            <option value="bg-white">Branco Puro</option>
                                            <option value="bg-gray-100">Cinza Claro</option>
                                            <option value="bg-gray-900">Preto (Dark)</option>
                                            <option value="bg-holi-primary">Holi Primary (Laranja)</option>
                                            <option value="bg-holi-secondary">Holi Secondary (Amarelo)</option>
                                            <option value="bg-red-600">Vermelho (Urgente)</option>
                                        </select>
                                    </label>
                                </div>

                                <div className="space-y-4">
                                    <label className="block">
                                        <span className="text-xs font-bold uppercase text-gray-500 mb-2 block">Conteúdo Resumido (Home)</span>
                                        <textarea
                                            rows={3}
                                            value={editingItem.content || ''}
                                            onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-holi-primary outline-none transition-all"
                                            placeholder="A grande novidade deste ano..."
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="text-xs font-bold uppercase text-gray-500 mb-2 block">Conteúdo Completo (Modal)</span>
                                        <textarea
                                            rows={4}
                                            value={editingItem.full_content || ''}
                                            onChange={(e) => setEditingItem({ ...editingItem, full_content: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-holi-primary outline-none transition-all"
                                            placeholder="Este é o detalhamento completo..."
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="text-xs font-bold uppercase text-gray-500 mb-2 block">URL da Imagem</span>
                                        <input
                                            type="text"
                                            value={editingItem.img || ''}
                                            onChange={(e) => setEditingItem({ ...editingItem, img: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-holi-primary outline-none transition-all"
                                            placeholder="https://..."
                                        />
                                    </label>

                                    <div className="grid grid-cols-3 gap-4">
                                        <label className="block text-center p-4 border-2 border-gray-100 rounded-2xl bg-gray-50 cursor-pointer hover:border-holi-primary transition-all">
                                            <input
                                                type="checkbox"
                                                checked={editingItem.torn}
                                                onChange={(e) => setEditingItem({ ...editingItem, torn: e.target.checked })}
                                                className="hidden"
                                            />
                                            <span className={`text-[10px] font-bold uppercase transition-colors ${editingItem.torn ? 'text-holi-primary' : 'text-gray-400'}`}>Rasgado</span>
                                        </label>
                                        <label className="block text-center p-4 border-2 border-gray-100 rounded-2xl bg-gray-50 cursor-pointer hover:border-holi-primary transition-all">
                                            <input
                                                type="checkbox"
                                                checked={editingItem.hot}
                                                onChange={(e) => setEditingItem({ ...editingItem, hot: e.target.checked })}
                                                className="hidden"
                                            />
                                            <span className={`text-[10px] font-bold uppercase transition-colors ${editingItem.hot ? 'text-orange-500' : 'text-gray-400'}`}>HOT</span>
                                        </label>
                                        <label className="block text-center p-4 border-2 border-gray-100 rounded-2xl bg-gray-50 cursor-pointer hover:border-holi-primary transition-all">
                                            <input
                                                type="checkbox"
                                                checked={editingItem.tape}
                                                onChange={(e) => setEditingItem({ ...editingItem, tape: e.target.checked })}
                                                className="hidden"
                                            />
                                            <span className={`text-[10px] font-bold uppercase transition-colors ${editingItem.tape ? 'text-blue-500' : 'text-gray-400'}`}>Fita</span>
                                        </label>
                                    </div>

                                    {editingItem.type === 'photo' && (
                                        <label className="block">
                                            <span className="text-xs font-bold uppercase text-gray-500 mb-2 block">Legenda da Foto</span>
                                            <input
                                                type="text"
                                                value={editingItem.caption || ''}
                                                onChange={(e) => setEditingItem({ ...editingItem, caption: e.target.value })}
                                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-holi-primary outline-none transition-all"
                                                placeholder="Ex: Momentos marcantes..."
                                            />
                                        </label>
                                    )}

                                    {(editingItem.type === 'list' || editingItem.type === 'standard') && (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold uppercase text-gray-500">Itens Resumidos (Home)</span>
                                                <button
                                                    onClick={() => setEditingItem({ ...editingItem, items: [...(editingItem.items || []), ''] })}
                                                    className="p-1 bg-gray-100 rounded-md hover:bg-gray-200"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            {(editingItem.items || []).map((item, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={item}
                                                        onChange={(e) => {
                                                            const newItems = [...(editingItem.items || [])]
                                                            newItems[index] = e.target.value
                                                            setEditingItem({ ...editingItem, items: newItems })
                                                        }}
                                                        className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-holi-primary outline-none text-sm"
                                                        placeholder={`Item ${index + 1}`}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newItems = (editingItem.items || []).filter((_, i) => i !== index)
                                                            setEditingItem({ ...editingItem, items: newItems })
                                                        }}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}

                                            <div className="flex justify-between items-center mt-4">
                                                <span className="text-xs font-bold uppercase text-gray-500">Itens Completos (Modal)</span>
                                                <button
                                                    onClick={() => setEditingItem({ ...editingItem, full_items: [...(editingItem.full_items || []), ''] })}
                                                    className="p-1 bg-gray-100 rounded-md hover:bg-gray-200"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            {(editingItem.full_items || []).map((item, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={item}
                                                        onChange={(e) => {
                                                            const newItems = [...(editingItem.full_items || [])]
                                                            newItems[index] = e.target.value
                                                            setEditingItem({ ...editingItem, full_items: newItems })
                                                        }}
                                                        className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-holi-primary outline-none text-sm"
                                                        placeholder={`Item Completo ${index + 1}`}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newItems = (editingItem.full_items || []).filter((_, i) => i !== index)
                                                            setEditingItem({ ...editingItem, full_items: newItems })
                                                        }}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {editingItem.type === 'quote' && (
                                        <label className="block">
                                            <span className="text-xs font-bold uppercase text-gray-500 mb-2 block">Autor da Citação</span>
                                            <input
                                                type="text"
                                                value={editingItem.author || ''}
                                                onChange={(e) => setEditingItem({ ...editingItem, author: e.target.value })}
                                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-holi-primary outline-none transition-all"
                                                placeholder="Nome do Autor"
                                            />
                                        </label>
                                    )}

                                    {editingItem.type === 'weather' && (
                                        <label className="block">
                                            <span className="text-xs font-bold uppercase text-gray-500 mb-2 block">Condição Completa (Modal)</span>
                                            <textarea
                                                rows={2}
                                                value={editingItem.full_desc_weather || ''}
                                                onChange={(e) => setEditingItem({ ...editingItem, full_desc_weather: e.target.value })}
                                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-holi-primary outline-none transition-all"
                                                placeholder="Ex: Sol forte durante todo o dia, beba muita água!"
                                            />
                                        </label>
                                    )}

                                    {editingItem.type === 'grid' && (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold uppercase text-gray-500">Imagens da Grade (URLs)</span>
                                                <button
                                                    onClick={() => setEditingItem({ ...editingItem, images: [...(editingItem.images || []), ''] })}
                                                    className="p-1 bg-gray-100 rounded-md hover:bg-gray-200"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            {(editingItem.images || []).map((img, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={img}
                                                        onChange={(e) => {
                                                            const newImages = [...(editingItem.images || [])]
                                                            newImages[index] = e.target.value
                                                            setEditingItem({ ...editingItem, images: newImages })
                                                        }}
                                                        className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-holi-primary outline-none text-sm"
                                                        placeholder={`URL da Imagem ${index + 1}`}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newImages = (editingItem.images || []).filter((_, i) => i !== index)
                                                            setEditingItem({ ...editingItem, images: newImages })
                                                        }}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleSave(editingItem)}
                                        className="col-span-1 md:col-span-2 w-full bg-holi-primary hover:bg-holi-primary/80 text-white font-black py-5 rounded-2xl transition-all shadow-lg hover:shadow-holi-primary/40 flex items-center justify-center gap-3 mt-6 uppercase tracking-tighter text-lg"
                                    >
                                        <Save size={20} /> Salvar Alterações
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default NewsAdmin
