import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import { Sun, LogIn } from 'lucide-react'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null)
    const [userRole, setUserRole] = useState<'admin' | 'redator' | null>(null)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [authLoading, setAuthLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        checkUser()
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
        const { data: editor } = await supabase.from('news_editors').select('role').ilike('email', userEmail).single()
        if (editor) { setUserRole(editor.role as any); return }
        const { data: globalRole } = await supabase.from('user_roles').select('role').eq('user_id', userId).single()
        if (globalRole && (globalRole.role === 'admin' || globalRole.role === 'gestor')) { setUserRole('admin'); return }
        if (userEmail === 'richard.fullweb@gmail.com') { setUserRole('admin'); return }
        setUserRole(null)
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setAuthLoading(true)
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.toLowerCase().trim(), password })
        if (error) { setError('Falha no login: ' + error.message); setAuthLoading(false); return }
        await checkRole(data.user.email!, data.user.id)
        setUser(data.user)
        setAuthLoading(false)
    }

    if (authLoading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-marker text-4xl">Carregando...</div>

    if (!user || !userRole) {
        return (
            <div className="min-h-screen bg-[#050208] text-white flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Sun className="text-holi-primary mx-auto mb-4" size={48} />
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Área Restrita</h1>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4 bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl">
                        {error && <div className="bg-red-500/20 border border-red-500 text-red-500 p-4 rounded-xl text-xs font-bold uppercase">{error}</div>}
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:border-holi-primary outline-none" placeholder="E-mail" required />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:border-holi-primary outline-none" placeholder="Senha" required />
                        <button type="submit" className="w-full bg-holi-primary hover:bg-holi-primary/80 text-white font-black py-5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 mt-6 uppercase tracking-tighter text-lg">
                            <LogIn size={22} /> Acessar
                        </button>
                    </form>
                </motion.div>
            </div>
        )
    }

    return <>{children}</>
}
