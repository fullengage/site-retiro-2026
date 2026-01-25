import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard, Users, Image as ImageIcon,
    ShoppingBag, LogIn, Sun, LogOut, Menu, X, Shield
} from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AdminLayout() {
    const [user, setUser] = useState<any>(null)
    const [userRole, setUserRole] = useState<'admin' | 'redator' | null>(null)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [authLoading, setAuthLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const location = useLocation()

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
        }
        setAuthLoading(false)
    }

    const checkRole = async (userEmail: string, userId: string) => {
        // 1. Check specialized editors table
        const { data: editor } = await supabase
            .from('news_editors')
            .select('role')
            .ilike('email', userEmail)
            .single()

        if (editor) {
            setUserRole(editor.role as any)
            return
        }

        // 2. Fallback: Global user roles
        const { data: globalRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .single()

        if (globalRole && (globalRole.role === 'admin' || globalRole.role === 'gestor')) {
            setUserRole('admin') // Global managers get admin access
            return
        }

        // 3. Hardcoded Super Admin (Fallback)
        if (userEmail === 'richard.fullweb@gmail.com') {
            setUserRole('admin')
            return
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

        // Verify permissions after login
        await checkRole(data.user.email!, data.user.id)
        setUser(data.user)
        setAuthLoading(false)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/admin' // Force reload/redirect
    }

    // Loading View
    if (authLoading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center font-marker text-4xl">
                <Sun className="animate-spin-slow text-holi-primary mr-4" size={48} />
                Carregando...
            </div>
        )
    }

    // Login View (if not authenticated or no role)
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
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Área Administrativa</h1>
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

    // Authenticated Layout
    const menuItems = [
        { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Painel / Notícias', exact: true },
        { path: '/admin/inscricoes', icon: <Users size={20} />, label: 'Inscrições' },
        { path: '/admin/galeria', icon: <ImageIcon size={20} />, label: 'Galeria' },
        { path: '/admin/doacoes', icon: <ShoppingBag size={20} />, label: 'Doações' },
    ]

    return (
        <div className="flex h-screen bg-[#050208] text-white overflow-hidden font-display">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                className={`
                    fixed md:relative z-50 h-full w-72 bg-[#0a050f] border-r border-white/5 flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-holi-primary/20 rounded-xl flex items-center justify-center text-holi-primary">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h2 className="font-black uppercase tracking-tighter text-lg leading-none">Admin</h2>
                            <p className="text-[10px] text-gray-500 font-mono mt-1">RETIRO 2026</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = item.exact
                            ? location.pathname === item.path
                            : location.pathname.startsWith(item.path)

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`
                                    flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm uppercase tracking-wide
                                    ${isActive
                                        ? 'bg-holi-primary text-white shadow-lg shadow-holi-primary/20'
                                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                                    }
                                `}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <div className="px-6 py-4 bg-white/5 rounded-2xl mb-4">
                        <p className="text-xs text-gray-400 font-bold mb-1">Logado como</p>
                        <p className="text-sm truncate font-mono text-holi-secondary">{user.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all uppercase text-xs tracking-widest"
                    >
                        <LogOut size={16} /> Sair
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Mobile Header */}
                <header className="md:hidden p-4 flex items-center justify-between border-b border-white/5 bg-[#0a050f]/80 backdrop-blur-md z-30 sticky top-0">
                    <div className="flex items-center gap-3">
                        <Sun className="text-holi-primary" size={24} />
                        <span className="font-black uppercase">Painel</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-white">
                        <Menu size={24} />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto bg-[#050208] relative scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                    <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none fixed"></div>
                    <div className="relative z-10">
                        <Outlet context={{ user, userRole }} />
                    </div>
                </div>
            </main>
        </div>
    )
}
