import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Background from './components/Background'
import HomePage from './pages/HomePage'
import DonationPage from './pages/DonationPage'
import SchedulePage from './pages/SchedulePage'
import NewsPage from './pages/NewsPage'
import NewsAdmin from './pages/NewsAdmin'
import RegistrationPage from './pages/RegistrationPage'
import RegistrationAdmin from './pages/RegistrationAdmin'
import GalleryAdmin from './pages/GalleryAdmin'
import DonationAdmin from './pages/DonationAdmin'
import ComingSoonPage from './pages/ComingSoonPage'
import AdminLayout from './components/AdminLayout'
import AuthGuard from './components/AuthGuard'

// Scroll to top on route change
function ScrollToTop() {
    const { pathname } = useLocation()
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])
    return null
}

function AppContent() {
    const { pathname } = useLocation()
    const isAdmin = pathname.startsWith('/admin')
    const isComingSoon = pathname === '/em-breve'

    return (
        <div className="min-h-screen bg-holi-dark text-gray-100 font-display selection:bg-holi-primary selection:text-white overflow-x-hidden">
            {!isComingSoon && <Background />}
            {!isAdmin && !isComingSoon && <Navbar />}

            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/doacoes" element={<DonationPage />} />
                <Route path="/cronograma" element={<SchedulePage />} />
                <Route path="/inscricao" element={<RegistrationPage />} />
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<NewsAdmin />} />
                    <Route path="galeria" element={<GalleryAdmin />} />
                    <Route path="doacoes" element={<DonationAdmin />} />
                </Route>
                <Route path="/admin/inscricoes" element={<AuthGuard><RegistrationAdmin /></AuthGuard>} />
                <Route path="/em-breve" element={<ComingSoonPage />} />
            </Routes>

            {!isAdmin && !isComingSoon && (
                <footer className="py-12 bg-holi-surface border-t border-white/10 relative z-10">
                    <div className="max-w-7xl mx-auto px-4 text-center">
                        <div className="font-marker text-2xl mb-8">RETIRO DE CARNAVAL 2026</div>

                        <div className="flex flex-wrap justify-center gap-8 mb-8 font-mono text-sm uppercase tracking-widest text-gray-400">
                            <Link to="/doacoes" className="hover:text-holi-primary transition-colors">Doações</Link>
                            <Link to="/noticias" className="hover:text-holi-secondary transition-colors">Notícias</Link>
                            <Link to="/em-breve" className="hover:text-holi-accent transition-colors">Cronograma</Link>
                            <a href="/#sobre" className="hover:text-white transition-colors">Sobre Nós</a>
                        </div>


                        <p className="text-gray-500 text-sm">© 2026 Comunidade Voz de Deus. NH/SP.</p>
                    </div>
                </footer>
            )}
        </div>
    )
}

function App() {
    return (
        <Router>
            <ScrollToTop />
            <AppContent />
        </Router>
    )
}

export default App
