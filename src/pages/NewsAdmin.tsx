import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Quote, Sun, Plus, Trash2, Edit2, Save, LogIn, Users, Shield, UserPlus, Image as ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Tipagem baseada na tabela
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
    const [news, setNews] = useState<NewsItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [editingItem, setEditingItem] = useState<Partial<NewsItem> | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Auth & Permission States
    const [user, setUser] = useState<any>(null)
    const [userRole, setUserRole] = useState<'admin' | 'redator' | null>(null)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [authLoading, setAuthLoading] = useState(true)

    // Redatores Management
    const [showEditors, setShowEditors] = useState(false)
    const [editors, setEditors] = useState<any[]>([])
    const [newEditorEmail, setNewEditorEmail] = useState('')
    const [newEditorRole, setNewEditorRole] = useState<'admin' | 'redator'>('redator')

    useEffect(() => {
        checkUser()
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setUser(session.user)
                checkRole(session.user.email!, session.user.id)
            } else {
                setUser(null)
                setUserRole(null)
            }
        })
        return () => subscription.unsubscribe()
    }, [])

    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
            setUser(session.user)
            await checkRole(session.user.email!, session.user.id)
            fetchNews()
        }
        setAuthLoading(false)
    }

    const checkRole = async (userEmail: string, userId: string) => {
        // 1. Verificar na tabela específica de redatores
        const { data: editor } = await supabase
            .from('news_editors')
            .select('role')
            .ilike('email', userEmail)
            .single()

        if (editor) {
            setUserRole(editor.role as any)
            if (editor.role === 'admin') fetchEditors()
            return
        }

        // 2. Fallback: Verificar na tabela global de roles (user_roles)
        const { data: globalRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId) // Usando o ID do usuário logado
            .single()

        if (globalRole) {
            // Mapear 'gestor' ou 'admin' do sistema global para acesso ao admin de notícias
            if (globalRole.role === 'admin' || globalRole.role === 'gestor') {
                setUserRole('admin') // Dá acesso total de admin para gestores globais
                fetchEditors()
                return
            }
        }

        setUserRole(null)
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setAuthLoading(true)

        const normalizedEmail = email.toLowerCase().trim()

        const { data, error } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password
        })

        if (error) {
            setError('Falha no login: ' + error.message)
            setAuthLoading(false)
            return
        }

        // Verificar permissões em ambas as tabelas
        const { data: editor } = await supabase
            .from('news_editors')
            .select('*')
            .ilike('email', normalizedEmail)
            .single()

        const { data: globalRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user.id)
            .single()

        const hasAccess = editor || (globalRole && (globalRole.role === 'admin' || globalRole.role === 'gestor')) || normalizedEmail === 'richard.fullweb@gmail.com'

        if (!hasAccess) {
            setError('Acesso negado. Você não tem permissão de Gestor ou Redator.')
            await supabase.auth.signOut()
            setAuthLoading(false)
        } else {
            setUser(data.user)
            const resolvedRole = (editor?.role === 'admin' || globalRole?.role === 'admin' || globalRole?.role === 'gestor' || normalizedEmail === 'richard.fullweb@gmail.com') ? 'admin' : 'redator'
            setUserRole(resolvedRole)
            fetchNews()
            if (resolvedRole === 'admin') fetchEditors()
            setAuthLoading(false)
        }
    }

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

    // Login View
    if (authLoading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-marker text-4xl">Autenticando...</div>

    if (!user || !userRole) {
        return (
            <div className="min-h-screen bg-[#050208] text-white flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md relative z-10"
                >
                    <div className="text-center mb-8">
                        <div className="inline-block p-4 bg-white/5 border border-white/10 rounded-3xl mb-4">
                            <Sun className="text-holi-primary animate-spin-slow" size={48} />
                        </div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Área de Redação</h1>
                        <p className="text-gray-500 font-mono text-sm mt-2">AUTENTICAÇÃO REQUERIDA</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4 bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl shadow-2xl">
                        {error && (
                            <div className="bg-red-500/20 border border-red-500 text-red-500 p-4 rounded-xl text-xs font-bold uppercase mb-4">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-2 ml-2 tracking-widest">E-mail Administrativo</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:border-holi-primary outline-none transition-all font-mono text-sm"
                                placeholder="exemplo@gmail.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-2 ml-2 tracking-widest">Senha de Acesso</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:border-holi-primary outline-none transition-all font-mono text-sm"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={authLoading}
                            className="w-full bg-holi-primary hover:bg-holi-primary/80 text-white font-black py-5 rounded-2xl transition-all shadow-lg hover:shadow-holi-primary/40 flex items-center justify-center gap-3 mt-6 uppercase tracking-tighter text-lg"
                        >
                            {authLoading ? 'Verificando...' : (
                                <>
                                    <LogIn size={22} />
                                    Acessar Painel
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        )
    }

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-marker text-4xl">Carregando painel...</div>

    return (
        <div className="min-h-screen bg-[#050208] text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
                    <div>
                        <div className="flex items-center gap-4">
                            <h1 className="text-4xl font-black uppercase tracking-tighter">Painel de Notícias</h1>
                            <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-[10px] font-bold border border-green-500/20">AUTENTICADO</span>
                        </div>
                        <p className="text-gray-500 font-mono text-sm mt-2">SUPABASE CMS v1.0 • {user.email}</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => window.location.href = '/admin/inscricoes'}
                            className="bg-holi-accent hover:bg-holi-accent/80 text-black px-6 py-4 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-holi-accent/30"
                        >
                            <Users size={20} />
                            Inscrições
                        </button>
                        <button
                            onClick={() => window.location.href = '/admin/galeria'}
                            className="bg-holi-secondary hover:bg-holi-secondary/80 text-black px-6 py-4 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-holi-secondary/30"
                        >
                            <ImageIcon size={20} />
                            Galeria
                        </button>
                        {userRole === 'admin' && (
                            <button
                                onClick={() => setShowEditors(!showEditors)}
                                className={`px-6 py-4 rounded-full font-bold flex items-center gap-2 transition-all border-2 ${showEditors ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white/10 hover:border-white/40'}`}
                            >
                                <Users size={20} />
                                {showEditors ? 'Ver Notícias' : 'Redatores'}
                            </button>
                        )}
                        <button
                            onClick={async () => {
                                await supabase.auth.signOut()
                                window.location.reload()
                            }}
                            className="bg-black/40 hover:bg-red-500/20 border border-white/10 text-gray-400 hover:text-red-500 px-6 py-4 rounded-full font-bold transition-all text-xs uppercase tracking-widest"
                        >
                            Sair
                        </button>
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
                                <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
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
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-holi-primary outline-none font-mono"
                                        required
                                    />
                                </div>
                                <select
                                    value={newEditorRole}
                                    onChange={(e) => setNewEditorRole(e.target.value as any)}
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none"
                                >
                                    <option value="redator" className="bg-gray-900">Redator</option>
                                    <option value="admin" className="bg-gray-900">Admin</option>
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
                                                <div className="font-bold flex items-center gap-2">
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
                                <h3 className="font-bold text-lg mb-2 truncate">{item.title || item.marker || 'Sem título'}</h3>
                                <p className="text-gray-400 text-sm line-clamp-3 mb-4">{item.content}</p>
                                <div className="text-[10px] text-gray-600 font-mono uppercase tracking-tighter">ORDEM: {item.order_index} • {item.type}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Edição */}
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
                                                        placeholder="https://..."
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
                                </div>
                            </div>

                            <div className="mt-12 flex gap-4">
                                <button
                                    onClick={() => handleSave(editingItem)}
                                    className="flex-1 bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-900 transition-all shadow-xl"
                                >
                                    <Save size={20} />
                                    Salvar Alterações
                                </button>
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default NewsAdmin
