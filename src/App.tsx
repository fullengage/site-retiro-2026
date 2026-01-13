import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Background from './components/Background'
import HomePage from './pages/HomePage'
import DonationPage from './pages/DonationPage'
import SchedulePage from './pages/SchedulePage'
import NewsAdmin from './pages/NewsAdmin'
import RegistrationPage from './pages/RegistrationPage'
import RegistrationAdmin from './pages/RegistrationAdmin'
import GalleryAdmin from './pages/GalleryAdmin'

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

    return (
        <div className="min-h-screen bg-holi-dark text-gray-100 font-display selection:bg-holi-primary selection:text-white overflow-x-hidden">
            <Background />
            {!isAdmin && <Navbar />}

            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/doacoes" element={<DonationPage />} />
                <Route path="/cronograma" element={<SchedulePage />} />
                <Route path="/inscricao" element={<RegistrationPage />} />
                <Route path="/admin" element={<NewsAdmin />} />
                <Route path="/admin/inscricoes" element={<RegistrationAdmin />} />
                <Route path="/admin/galeria" element={<GalleryAdmin />} />
            </Routes>

            {!isAdmin && (
                <footer className="py-12 bg-holi-surface border-t border-white/10 relative z-10">
                    <div className="max-w-7xl mx-auto px-4 text-center">
                        <div className="font-marker text-2xl mb-8">RETIRO DE CARNAVAL 2026</div>

                        <div className="flex flex-wrap justify-center gap-8 mb-8 font-mono text-sm uppercase tracking-widest text-gray-400">
                            <Link to="/doacoes" className="hover:text-holi-primary transition-colors">Doações</Link>
                            <a href="/#noticias" className="hover:text-holi-secondary transition-colors">Notícias</a>
                            <Link to="/cronograma" className="hover:text-holi-accent transition-colors">Cronograma</Link>
                            <a href="/#sobre" className="hover:text-white transition-colors">Sobre Nós</a>
                        </div>

                        <div className="flex justify-center space-x-6 mb-8 text-gray-400">
                            <a href="#" className="hover:text-holi-primary transition-colors">
                                <i className="fab fa-instagram text-2xl"></i>
                            </a>
                            <a href="#" className="hover:text-holi-secondary transition-colors">
                                <i className="fab fa-facebook text-2xl"></i>
                            </a>
                            <a href="#" className="hover:text-white transition-colors">
                                <i className="fas fa-envelope text-2xl"></i>
                            </a>
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
